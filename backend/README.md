# Backend

Web application. Provides REST API for jobs management.

Produce `TODO_DIR` and read data from `PENDING_DIR` and `DONE_DIR`. Can kill the Dose3D process.

## Prepare for usage

1. Copy `../config.txt.sample` to `../config.txt`.
2. Adjust `config.txt` settings for your platform.
3. Create `python -m venv venv` and activate them (`source venv/bin/activate`).
4. Install dependency `python -m pip install -r requirements.txt`.
5. Initialize DB `python manage.py migrate`.
6. Initialize user `python manage.py createsuperuser`.
7. Compile frontend `see ../frontend/README.md`.
8. Collect static files `python manage.py collectstatic`.
9. Configure your WSGI web server (i.e. Apache) to run `./backend/wsgi.py` or run `daphne` and configure proxy.

Run Daphne server with local host access only: `daphne -p 8080 -b 127.0.0.1 backend.asgi:application`.

## Road map

Future features:

* list jobs (todo/pending/done)
* create new job
* kill Dose3D process
