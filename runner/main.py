import os
import time
import shutil
import subprocess
import sys
import pathlib

import psutil
from dose3d import JobsManager


def execute_job(job):
    job_id = job.job_id
    print('Start job %s...' % job_id)

    # extract job ID from job file name
    args_file = job.get_args_file()
    ready_file = job.get_ready_file()
    job_file = job.get_toml_file()

    # prepare PENDING/job_id path
    job_path = job.get_running_job_path()
    os.makedirs(job_path)

    # move TODO/job_id.dat to PENDING/job_id/input.dat
    input_toml_fn = os.path.join(job_path, 'input.toml')
    shutil.move(job_file, input_toml_fn)

    # read args from TODO/job_id.args
    with open(args_file, 'rt') as af:
        args = af.readline().split()

    # and remove TODO/job_id.ready and TODO/job_id.args
    os.remove(args_file)
    os.remove(ready_file)

    # execute Dose3D: DOSE3D_EXEC -t PENDING/job_id/input.toml -f
    exe = [job.jm.DOSE3D_EXEC, '-t', input_toml_fn, '-o', job_path, *args]
    print('Execute: %s' % ' '.join(exe))
    p = subprocess.Popen(exe, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    # write PID to PENDING/job_id/pid file
    pid_fn = job.get_pid_file()
    with open(pid_fn, 'wt') as pf:
        pf.write('%d' % p.pid)
    print('PID of process: %d' % p.pid)

    # waiting for logs line or close process and write logs to PENDING/job_id/log.txt
    log_fn = os.path.join(job_path, 'log.txt')
    while True:
        retcode = p.poll()
        line = p.stdout.readline()
        with open(log_fn, 'ab') as fl:
            fl.write(line)
            print('> %s' % line.decode("utf-8"), end='')

        # if process closed break loop and remove pid file and write return code to PENDING/job_id/retcode.txt
        if retcode is not None:
            # remove pid file
            os.remove(pid_fn)

            # write return code to file
            retcode_fn = os.path.join(job_path, 'retcode.txt')
            with open(retcode_fn, 'wt') as rf:
                rf.write('%d' % retcode)
            print('\nEnd with code: %d' % retcode)
            break

    # move PENDING/job_id to DONE/job_id
    done_path = job.get_done_job_path()
    shutil.move(job_path, done_path)


def clean_orphan_job(job):
    job_path = job.get_running_job_path()
    done_path = job.get_done_job_path()
    pid_fn = os.path.join(job_path, 'pid')

    # check for running Dose3D process
    if os.path.exists(pid_fn):
        with open(pid_fn, 'rt') as pf:
            pid = int(pf.readline())

        try:
            while True:
                process = psutil.Process(pid)

                # check if it is Dose3D process
                if process.name() == os.path.basename(job.jm.DOSE3D_EXEC):
                    print('Orphan job "%s" is running, wait for finish process PID %d...' % (job.job_id, pid))
                else:
                    pass  # another process just too over the same PID

                time.sleep(1)

        except psutil.NoSuchProcess:
            pass  # process done

        try:
            os.remove(pid_fn)
        except FileNotFoundError:
            pass

        print('Process %d is done, job "%s" is finished, move to DONEs' % (pid, job.job_id))
    else:
        print('Orphan job "%s" is finished, move to DONEs' % job.job_id)

    shutil.move(job_path, done_path)


def main():
    main_dir = pathlib.Path(__file__).parent.resolve().parent.resolve()
    config_file = os.path.join(main_dir, 'config.txt')

    # load config
    print('Load config from: ' + config_file)

    try:
        jm = JobsManager(config_file, True)
    except ValueError as e:
        print('Error! ' + str(e), file=sys.stderr)
        exit(1)

    print('Used config settings:')
    print('QUEUE_DIR = ' + jm.QUEUE_DIR)
    print('RUNNING_DIR = ' + jm.RUNNING_DIR)
    print('DONE_DIR = ' + jm.DONE_DIR)
    print('DOSE3D_EXEC = ' + jm.DOSE3D_EXEC)
    print('SLEEP = ' + str(jm.SLEEP))

    jm.init_dirs_if_need()

    # check some config settings
    if not os.path.exists(jm.DOSE3D_EXEC):
        print('Error! File %s not found' % jm.DOSE3D_EXEC, file=sys.stderr)
        exit(1)
    if not (1 <= jm.SLEEP <= 3600):
        print('Error! SLEEP should be between 1 and 3600', file=sys.stderr)
        exit(1)

    # main loop
    print('\nStart loop QUEUE_DIR crawler loop...\n')
    while True:
        # Stage 1: search for orphan running jobs and clean
        running_jobs = jm.get_running_jobs()
        for job in running_jobs:
            clean_orphan_job(job)

        # Stage 2: search for new files in QUEUE directory
        # the new job should have 2 files:
        # - new_job_id.dat
        # - new_job_id.dat.ready
        # the second file inform the writing of new_job_id.dat is done and can be consumed by runner
        new_jobs = jm.get_jobs_from_queue()
        found_ready = None
        for job in new_jobs:
            if job.ready:
                print('Found new ready job: ' + job.job_id)
                found_ready = job
                break
            else:
                print('Found new job but is not ready yet: ' + job.job_id)

        # Stage 3: the job is ready, so move to PENDING and execute Dose3D
        if found_ready:
            execute_job(found_ready)

        # Stage 4: wait for
        print('.', end='')
        time.sleep(jm.SLEEP)


if __name__ == "__main__":
    main()
