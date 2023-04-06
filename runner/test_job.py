import os
import shutil
import pathlib

from main import load_config

if __name__ == "__main__":
    # load config
    main_dir = pathlib.Path(__file__).parent.resolve().parent.resolve()
    config_file = os.path.join(main_dir, 'config.txt')
    config = load_config(config_file)

    # check exists IDs
    _id = 0
    while True:
        _id += 1
        job_id = 'test_%d' % _id
        if os.path.exists(os.path.join(config['QUEUE_DIR'], job_id + '.toml')):
            continue
        if os.path.exists(os.path.join(config['RUNNING_DIR'], job_id)):
            continue
        if os.path.exists(os.path.join(config['DONE_DIR'], job_id)):
            continue

        break

    # found, so copy
    shutil.copyfile('../test/example_job.toml', os.path.join(config['QUEUE_DIR'], job_id + '.toml'))

    with open(os.path.join(config['QUEUE_DIR'], job_id + '.args'), 'wt') as af:
        af.write('-f')
    with open(os.path.join(config['QUEUE_DIR'], job_id + '.ready'), 'wt') as rf:
        rf.write('ok')

    print('Test job created: ' + job_id)
