import os
import pathlib


class JobsManager:
    """Manage Dose3D jobs"""

    config = None

    QUEUE_DIR = None
    RUNNING_DIR = None
    DONE_DIR = None
    DOSE3D_EXEC = None
    SLEEP = None

    main_dir = None

    def __init__(self, config_file=None, init_dirs=False, main_dir=None):
        # get main dir of project
        if main_dir is None:
            self.main_dir = pathlib.Path(__file__).parent.resolve().parent.resolve().parent.resolve()
        else:
            self.main_dir = main_dir

        # load config file
        self.load_config(config_file)

        # create jobs dirs if need
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

        # validate SLEEP number value
        try:
            self.SLEEP = int(self.config["SLEEP"])
        except ValueError:
            raise ValueError('SLEEP must be number')

    def init_dirs_if_need(self):
        """Create JOBs dirs if not exists"""
        os.makedirs(self.QUEUE_DIR, exist_ok=True)
        os.makedirs(self.RUNNING_DIR, exist_ok=True)
        os.makedirs(self.DONE_DIR, exist_ok=True)

    def get_files_by_date(self, path):
        """Get list of files from path sorted by created date"""
        a = [s for s in os.listdir(path)
             if os.path.isfile(os.path.join(path, s))]
        a.sort(key=lambda s: os.path.getctime(os.path.join(path, s)))
        return a

    def get_jobs_from_queue(self):
        """
        Get list of job_id in queue sorted by create date.
        Return: list of [job_id, ready]
        """

        jobs = []
        new_files = self.get_files_by_date(self.QUEUE_DIR)
        for f in new_files:
            if f.endswith('.toml'):
                base_file = os.path.basename(f)
                job_id = os.path.splitext(base_file)[0]
                ready_file = os.path.join(self.QUEUE_DIR, job_id + '.ready')
                if os.path.exists(ready_file):
                    jobs.append([job_id, True])
                    break
                else:
                    jobs.append([job_id, False])

        return jobs
