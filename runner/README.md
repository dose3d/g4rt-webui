# Runner

Working in loop as daemon process. Consume jobs from `QUEUE_DIR` and produce `RUNNING_DIR` and `DONE_DIR`.

The algorithm of loop:
1. Looking for orphan jobs in `RUNNING_DIR` and wait for finish and move to `DONE_DIR`.
2. Looking for new job in `QUEUE_DIR` (new `{job_id}.ready` file).
3. Create `RUNNING_DIR/{job_id}` and remove job from `QUEUE_DIR`.
4. Execute Dose3D and save PID and logs and results in `RUNNING_DIR/{job_id}`.
5. Move `RUNNING_DIR/{job_id}` to `DONE_DIR/{job_id}`.
6. Back to 1.

The script never stops. You must kill the python process.

## Prepare for usage

1. Copy `../config.txt.sample` to `../config.txt`
2. Adjust `config.txt` settings for your platform

Tested on Python 3.11. It only uses the standard library and `psutil` (included in `requirements.txt`).

## Run
 
Execution:
```
python main.py
```

## Test

Please prepare `../test/example_job.toml` by `README.md` and execute:

```
python test_job.py
```

It causes add a new job for Runner.
