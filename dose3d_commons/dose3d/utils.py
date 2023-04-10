import os


def load_int_from_file(fn):
    if os.path.exists(fn):
        with open(fn, 'rt') as pf:
            return int(pf.readline())
    return None


def load_all_from_file(fn):
    with open(fn, 'rt') as f:
        return ''.join(f.readlines())


def write_all_to_file(fn, content):
    with open(fn, 'wt') as f:
        f.write(content)


def get_files_by_date(path):
    """Get list of files from path sorted by created date"""
    a = [s for s in os.listdir(path)
         if os.path.isfile(os.path.join(path, s))]
    a.sort(key=lambda s: os.path.getctime(os.path.join(path, s)))
    return a


def get_dirs(path):
    """Get list of dirs from path"""
    a = [s for s in os.listdir(path)
         if os.path.isdir(os.path.join(path, s))]
    return a
