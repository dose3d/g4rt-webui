# Runner

Working in loop as daemon process. Consume jobs from `TODO_DIR` and produce `PENDING_DIR` and `DONE_DIR`.

The algorithm of loop:
1. Looking for new job in `TODO_DIR` (new `{job_id}.ready` file).
2. Create `PENDING_DIR/{job_id}` and remove job from `TODO_DIR`.
3. Execute Dose3D and save PID and logs and results in `PENDING_DIR/{job_id}`.
4. Move `PENDING_DIR/{job_id}` to `DONE_DIR/{job_id}`.
5. Back to 1.

The script never stops. You must kill the python process.

## Prepare for usage

1. Copy `../config.txt.sample` to `../config.txt`
2. Adjust `config.txt` settings for your platform

Tested on Python 3.11. It only uses the standard library. You don't need to install anything with pip.

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

## Road map

Future features:

* Clear `PENDING_DIR` on restart Runner.
