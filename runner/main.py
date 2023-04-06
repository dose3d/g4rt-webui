import os
import time
import shutil
import subprocess
import sys
import pathlib

import psutil


def load_config(config_file):
    config_values = {}

    with open(config_file, 'rt') as c:
        for line in c.readlines():
            [key, value] = line.strip().split('=')
            key = key.strip()
            if key and key[0] != '#':
                config_values[key] = value.strip()
    return config_values


def get_files_by_date(path):
    a = [s for s in os.listdir(path)
         if os.path.isfile(os.path.join(path, s))]
    a.sort(key=lambda s: os.path.getmtime(os.path.join(path, s)))
    return a


def get_dirs(path):
    a = [s for s in os.listdir(path)
         if os.path.isdir(os.path.join(path, s))]
    return a


def execute_job(config, job_id):
    print('Start job %s...' % job_id)

    # extract job ID from job file name
    args_file = os.path.join(config['QUEUE_DIR'], job_id + ".args")
    ready_file = os.path.join(config['QUEUE_DIR'], job_id + ".ready")
    job_file = os.path.join(config['QUEUE_DIR'], job_id + ".toml")

    # prepare PENDING/job_id path
    job_path = os.path.join(config['RUNNING_DIR'], job_id)
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
    exe = [config["DOSE3D_EXEC"], '-t', input_toml_fn, '-o', job_path, *args]
    print('Execute: %s' % ' '.join(exe))
    p = subprocess.Popen(exe, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    # write PID to PENDING/job_id/pid file
    pid_fn = os.path.join(job_path, 'pid')
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
    done_path = os.path.join(config['DONE_DIR'], job_id)
    shutil.move(job_path, done_path)


def clean_orphan_job(config, job_id):
    job_path = os.path.join(config['RUNNING_DIR'], job_id)
    done_path = os.path.join(config['DONE_DIR'], job_id)
    pid_fn = os.path.join(job_path, 'pid')

    # check for running Dose3D process
    if os.path.exists(pid_fn):
        with open(pid_fn, 'rt') as pf:
            pid = int(pf.readline())

        try:
            while True:
                process = psutil.Process(pid)

                # check if it is Dose3D process
                if process.name() == os.path.basename(config["DOSE3D_EXEC"]):
                    print('Orphan job "%s" is running, wait for finish process PID %d...' % (job_id, pid))
                else:
                    pass  # another process just too over the same PID

                time.sleep(1)

        except psutil.NoSuchProcess:
            pass  # process done

        try:
            os.remove(pid_fn)
        except FileNotFoundError:
            pass

        print('Process %d is done, job "%s" is finished, move to DONEs' % (pid, job_id))
    else:
        print('Orphan job "%s" is finished, move to DONEs' % job_id)

    shutil.move(job_path, done_path)


def main():
    main_dir = pathlib.Path(__file__).parent.resolve().parent.resolve()
    config_file = os.path.join(main_dir, 'config.txt')

    # load config
    print('Load config from: ' + config_file)
    config = load_config(config_file)

    print('Used config settings:')
    print('QUEUE_DIR = ' + os.path.abspath(config['QUEUE_DIR']))
    print('RUNNING_DIR = ' + os.path.abspath(config['RUNNING_DIR']))
    print('DONE_DIR = ' + os.path.abspath(config['DONE_DIR']))
    print('DOSE3D_EXEC = ' + os.path.abspath(config['DOSE3D_EXEC']))
    print('SLEEP = ' + config['SLEEP'])

    os.makedirs(config['QUEUE_DIR'], exist_ok=True)
    os.makedirs(config['RUNNING_DIR'], exist_ok=True)
    os.makedirs(config['DONE_DIR'], exist_ok=True)

    # check some config settings
    if not os.path.exists(config['QUEUE_DIR']):
        print('Error! Path %s not found' % config['QUEUE_DIR'], file=sys.stderr)
        exit(1)
    if not os.path.exists(config['DOSE3D_EXEC']):
        print('Error! File %s not found' % config['DOSE3D_EXEC'], file=sys.stderr)
        exit(1)
    try:
        s = int(config['SLEEP'])
        if not (1 <= s <= 3600):
            print('Error! SLEEP should be between 1 and 3600', file=sys.stderr)
            exit(1)
    except ValueError:
        print('Error! SLEEP not a number', file=sys.stderr)
        exit(1)

    # main loop
    print('\nStart loop QUEUE_DIR crawler loop...\n')
    while True:
        # Stage 1: search for orphan running jobs and clean
        running_jobs = get_dirs(config['RUNNING_DIR'])
        for d in running_jobs:
            job_id = os.path.basename(d)
            clean_orphan_job(config, job_id)

        # Stage 2: search for new files in QUEUE directory
        # the new job should have 2 files:
        # - new_job_id.dat
        # - new_job_id.dat.ready
        # the second file inform the writing of new_job_id.dat is done and can be consumed by runner
        new_files = get_files_by_date(config['QUEUE_DIR'])
        found_ready = None
        for f in new_files:
            if f.endswith('.toml'):
                base_file = os.path.basename(f)
                job_id = os.path.splitext(base_file)[0]
                ready_file = os.path.join(config['QUEUE_DIR'], job_id + '.ready')
                if os.path.exists(ready_file):
                    print('Found new ready job: ' + job_id)
                    found_ready = job_id
                    break
                else:
                    print('Found new job but is not ready yet: ' + job_id)

        # Stage 3: the job is ready, so move to PENDING and execute Dose3D
        if found_ready:
            execute_job(config, found_ready)

        # Stage 4: wait for
        print('.', end='')
        time.sleep(int(config['SLEEP']))


if __name__ == "__main__":
    main()
