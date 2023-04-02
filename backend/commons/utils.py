import pathlib
import os


def load_config(config_file=None):
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

    return config_values
