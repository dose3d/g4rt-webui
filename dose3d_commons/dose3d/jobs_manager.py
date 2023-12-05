import os
import pathlib
import psutil
from pathlib import Path

from dose3d.dose3d_error import Dose3DException
from dose3d.job_manager import JobManager, INIT, QUEUE, RUNNING, DONE
from dose3d.utils import get_files_by_date, get_dirs


class JobsManager:
    """Manage Dose3D jobs"""

    config = None

    QUEUE_DIR = None
    RUNNING_DIR = None
    DONE_DIR = None
    DOSE3D_EXEC = None
    SLEEP = None
    CACHE_DIR = None
    MEDIA_DIR = None

    main_dir = None

    def __init__(self, config_file=None, init_dirs=False, main_dir=None):
        # get main dir of project
        if main_dir is None:
            self.main_dir = pathlib.Path(__file__).parent.resolve().parent.resolve().parent.resolve()
        else:
            self.main_dir = main_dir

        # load config file
        self.load_config(config_file)

        # create jobs dirs if needed
        if init_dirs:
            self.init_dirs_if_need()

    def load_config(self, config_file=None):
        """Load config from config_gile or from main_dir/config.txt"""

        if config_file is None:
            config_file = os.path.join(self.main_dir, 'config.txt')
        config_values = {}

        with open(config_file, 'rt') as c:
            for line in c.readlines():
                [key, value] = line.strip().split('=')
                key = key.strip()
                if key and key[0] != '#':  # ignore comments
                    config_values[key] = value.strip()
                    if key.endswith('_DIR') or key.endswith('_EXEC'):
                        # convert relative pathes to full pathes
                        config_values[key] = os.path.abspath(config_values[key])

        # fill class values by loaded config
        self.config = config_values
        self.QUEUE_DIR = self.config["QUEUE_DIR"]
        self.RUNNING_DIR = self.config["RUNNING_DIR"]
        self.DONE_DIR = self.config["DONE_DIR"]
        self.DOSE3D_EXEC = self.config["DOSE3D_EXEC"]
        self.MEDIA_DIR = self.config["MEDIA_DIR"]

        self.CACHE_DIR = self.config.get("CACHE_DIR", '/tmp/dose3d_cache')

        cache_dir = Path(self.CACHE_DIR)
        cache_dir.mkdir(parents=True, exist_ok=True)

        # validate SLEEP number value
        try:
            self.SLEEP = int(self.config["SLEEP"])
        except ValueError:
            raise Dose3DException('SLEEP must be number')

    def get_path_for_status(self, status):
        """Get path for Jobs by status"""
        if status == INIT:
            return self.QUEUE_DIR
        if status == QUEUE:
            return self.QUEUE_DIR
        if status == RUNNING:
            return self.RUNNING_DIR
        if status == DONE:
            return self.DONE_DIR
        raise Dose3DException('Invalid status: %s, should be QUEUE, RUNNING or DONE' % status)

    def init_dirs_if_need(self):
        """Create JOBs dirs if not exists"""
        os.makedirs(self.QUEUE_DIR, exist_ok=True)
        os.makedirs(self.RUNNING_DIR, exist_ok=True)
        os.makedirs(self.DONE_DIR, exist_ok=True)

    def get_jobs_from_queue(self):
        """
        Get list of job_id in queue sorted by create date.
        Return: list of objects of Job class
        """

        jobs = []
        new_files = get_files_by_date(self.QUEUE_DIR)
        for f in new_files:
            if f.endswith('.toml'):
                base_file = os.path.basename(f)
                job_id = os.path.splitext(base_file)[0]
                ready_file = os.path.join(self.QUEUE_DIR, job_id + '.ready')
                if os.path.exists(ready_file):
                    jobs.append(JobManager(self, job_id, True, QUEUE))
                    break
                else:
                    jobs.append(JobManager(self, job_id, False, QUEUE))

        return jobs

    def get_running_jobs(self):
        """Get list of running jobs"""
        jobs = []
        running_jobs = get_dirs(self.RUNNING_DIR)
        for d in running_jobs:
            job_id = os.path.basename(d)
            jobs.append(JobManager(self, job_id, status=RUNNING))
        return jobs

    def check_pid_is_dose3d(self, pid):
        """Check if PID process is Dose3D process. None - no process with this PID"""
        try:
            process = psutil.Process(pid)

            # check if it is Dose3D process
            return process.name() == os.path.basename(self.DOSE3D_EXEC)

        except psutil.NoSuchProcess:
            return None  # process done

    def get_job(self, job_id, update_status=True):
        """Build job instance and update status from dirs if update_status is true"""
        job = JobManager(self, job_id)
        if update_status:
            job.update_job_status()
        return job
