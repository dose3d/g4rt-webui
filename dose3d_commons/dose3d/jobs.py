import os
import pathlib


class JobsManager:
    config = None

    def __init__(self, config_file=None):
        self.load_config(config_file)

    def load_config(self, config_file=None):
        if config_file is None:
            main_dir = pathlib.Path(__file__).parent.resolve().parent.resolve().parent.resolve()
            config_file = os.path.join(main_dir, 'config.txt')
        config_values = {}

        with open(config_file, 'rt') as c:
            for line in c.readlines():
                [key, value] = line.strip().split('=')
                key = key.strip()
                if key and key[0] != '#':
                    config_values[key] = value.strip()
                    if key.endswith('_DIR') or key.endswith('_EXEC'):
                        config_values[key] = os.path.abspath(config_values[key])

        self.config = config_values

