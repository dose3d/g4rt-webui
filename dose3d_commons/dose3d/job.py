import os
import pathlib


class Job:
    """Manage of single job"""

    jm = None
    job_id = None
    ready = False

    def __init__(self, jm, job_id, ready=False):
        self.jm = jm
        self.job_id = job_id
        self.ready = ready

    def get_args_file(self):
        """Get args file of Job from QUEUE_DIR"""
        return os.path.join(self.jm.QUEUE_DIR, self.job_id + ".args")

    def get_ready_file(self):
        """Get ready file of Job from QUEUE_DIR"""
        return os.path.join(self.jm.QUEUE_DIR, self.job_id + ".ready")

    def get_toml_file(self):
        """Get TOML file of Job from QUEUE_DIR"""
        return os.path.join(self.jm.QUEUE_DIR, self.job_id + ".toml")

    def get_pid_file(self):
        return os.path.join(self.get_running_job_path(), 'pid')

    def get_running_job_path(self):
        """Get path for Job in RUNNING_DIR"""
        return os.path.join(self.jm.RUNNING_DIR, self.job_id)

    def get_done_job_path(self):
        """Get path for Job in DONE_DIR"""
        return os.path.join(self.jm.DONE_DIR, self.job_id)
