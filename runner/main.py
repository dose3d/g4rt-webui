import os
import time
import sys
import pathlib

from dose3d import JobsManager, Dose3DException


def execute_job(job):
    job_id = job.job_id
    print('Start job %s...' % job_id)

    job.move_from_queue_to_running()
    job.execute_dose3d(print)
    job.move_from_running_to_done()


def clean_orphan_job(job):
    # check for running Dose3D process
    pid = job.get_pid()
    if pid is not None:

        # Waiting for finish Dose3D process if needed
        while True:
            is_dose3d = job.jm.check_pid_is_dose3d(pid)
            if is_dose3d:
                print('Orphan job "%s" is running, wait for finish process PID %d...' % (job.job_id, pid))
                time.sleep(1)
            else:
                break

        # remove PID file
        try:
            os.remove(job.get_pid_file())
        except FileNotFoundError:
            pass

        print('Process %d is done, job "%s" is finished, move to DONEs' % (pid, job.job_id))
    else:
        print('Orphan job "%s" is finished, move to DONEs' % job.job_id)

    # Move from RUNNING to DONE
    job.move_from_running_to_done()


def main():
    main_dir = pathlib.Path(__file__).parent.resolve().parent.resolve()
    config_file = os.path.join(main_dir, 'config.txt')

    # load config
    print('Load config from: ' + config_file)

    try:
        jm = JobsManager(config_file, True)
    except Dose3DException as e:
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
