import os
import shutil
import subprocess

from dose3d.dose3d_error import Dose3DException


QUEUE = "queue"
RUNNING = "running"
DONE = "done"


class Job:
    """Manage of single job"""

    jm = None
    job_id = None
    ready = False

    status = None

    def __init__(self, jm, job_id, ready=False, status=None):
        self.jm = jm
        self.job_id = job_id
        self.ready = ready
        self.status = status

    def get_job_path(self, for_status=None):
        """Get path for job by status (for current status if for_status is None)"""
        if for_status is None:
            for_status = self.status
        path = self.jm.get_path_for_status(for_status)
        if for_status != QUEUE:
            return os.path.join(path, self.job_id)
        return path

    def get_args_file(self, for_status=None):
        """Get args file of Job from QUEUE_DIR"""
        return os.path.join(self.get_job_path(for_status), self.job_id + ".args")

    def get_ready_file(self):
        """Get ready file of Job from QUEUE_DIR"""
        return os.path.join(self.jm.QUEUE_DIR, self.job_id + ".ready")

    def get_toml_file(self, for_status=None):
        """Get TOML file of Job from QUEUE_DIR"""
        return os.path.join(self.get_job_path(for_status), self.job_id + ".toml")

    def get_pid_file(self):
        """Get file name with PID of Dose3D process"""
        return os.path.join(self.get_job_path(RUNNING), 'pid')

    def update_job_status(self):
        """Check status by QUEUE, PENDING and DONE dirs and update status and ready in self"""
        if os.path.exists(self.get_job_path(DONE)):
            self.status = DONE
        elif os.path.exists(self.get_job_path(RUNNING)):
            self.status = RUNNING
        elif os.path.exists(self.get_toml_file(QUEUE)):
            self.status = QUEUE
            self.ready = os.path.exists(self.get_ready_file())
        else:
            raise Dose3DException('Job %s not found' % self.job_id)

    def move_from_queue_to_running(self):
        """Move Job from QUEUE to RUNNING"""

        if self.status != QUEUE:
            raise Dose3DException('Job %s must be in QUEUE state, not in %s' % (self.job_id, self.status))

        # prepare RUNNING/job_id path
        job_path = self.get_job_path(RUNNING)
        os.makedirs(job_path)

        # move job_id.toml and job_id.args from QUEUE/ to RUNNING/job_id/
        shutil.move(self.get_toml_file(QUEUE), self.get_toml_file(RUNNING))
        shutil.move(self.get_args_file(QUEUE), self.get_args_file(RUNNING))

        # and remove QUEUE/job_id.ready
        os.remove(self.get_ready_file())

        self.status = RUNNING

    def load_dose3d_running_args(self):
        """Load Dose3D command line args"""
        args_file = self.get_args_file()
        with open(args_file, 'rt') as af:
            args = af.readline().split()
        return args

    def execute_dose3d(self, log_callback):
        """Execute Dose3D process and waiting for finish"""

        if self.status != RUNNING:
            raise Dose3DException('Job %s must be in RUNNING state, not in %s' % (self.job_id, self.status))

        # read args from QUEUE/job_id.args
        args = self.load_dose3d_running_args()

        # execute Dose3D: DOSE3D_EXEC -t PENDING/job_id/input.toml -f
        input_toml = self.get_toml_file()
        job_path = self.get_job_path()
        exe = [self.jm.DOSE3D_EXEC, '-t', input_toml, '-o', job_path, *args]
        log_callback('Execute: %s' % ' '.join(exe))
        p = subprocess.Popen(exe, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

        # write PID to PENDING/job_id/pid file
        pid_fn = self.get_pid_file()
        with open(pid_fn, 'wt') as pf:
            pf.write('%d' % p.pid)
        log_callback('PID of process: %d' % p.pid)

        # waiting for logs line or close process and write logs to PENDING/job_id/log.txt
        log_fn = os.path.join(job_path, 'log.txt')
        while True:
            retcode = p.poll()
            line = p.stdout.readline()
            with open(log_fn, 'ab') as fl:
                fl.write(line)
                log_callback('> %s' % line.decode("utf-8"), end='')

            # if process closed break loop and remove pid file and write return code to PENDING/job_id/retcode.txt
            if retcode is not None:
                # remove pid file
                os.remove(pid_fn)

                # write return code to file
                retcode_fn = os.path.join(job_path, 'retcode.txt')
                with open(retcode_fn, 'wt') as rf:
                    rf.write('%d' % retcode)
                log_callback('\nEnd with code: %d' % retcode)
                break

    def move_from_running_to_done(self):
        """Move Job from RUNNING/job_id to DONE/job_id"""

        if self.status != RUNNING:
            raise Dose3DException('Job %s must be in RUNNING state, not in %s' % (self.job_id, self.status))

        shutil.move(self.get_job_path(RUNNING), self.get_job_path(DONE))
        self.status = DONE

    def get_pid(self):
        """Load PID of running Job"""
        pid_fn = self.get_pid_file()
        if os.path.exists(pid_fn):
            with open(pid_fn, 'rt') as pf:
                return int(pf.readline())
        return None
