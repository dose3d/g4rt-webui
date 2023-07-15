# Backend

Web application. Provides REST API for jobs management.

Produce `TODO_DIR` and read data from `PENDING_DIR` and `DONE_DIR`. Can kill the Dose3D process.

## Prepare database

Now the Backend uses PostgreSQL database.

### Install PostgreSQL

Please install `postgresql` package with `libpg-dev`.
The `libpg-dev` is necessary for compile and install `psycopg2` Pythons package. 

```
$ sudo apt install postgresql libpg-dev
```

### Prepare PostgreSQL database.

Open command line and open `psql` with `postgres` superuser privileges:

```
$ sudo bash
# su postgres
# psql
```

Create user and database:

```postgresql
create user dose3d with password 'dose3d';
create database dose3d_test with owner dose3d;
```
If you use different user, password or database name please change `backend/settings.py`
in `DATABASES` setting.

## Prepare for usage

Please working in conda environment.
For activate conda environment please run: `conda deactivate ; conda activate dose3d`.

1. Copy `../config.txt.sample` to `../config.txt`.
2. Adjust `config.txt` settings for your platform.
3. Install dependency `python -m pip install -r ../requirements.txt`.
4. Initialize DB `python manage.py migrate`.
5. Initialize user `python manage.py createsuperuser`, 
   for running on localhost only please use `admin` username and `admin` password.
   You can use: `python manage.py createsuperuser --username admin --email admin@admin.com` command.
6. Compile frontend `see ../frontend/README.md`.
7. Collect static files `python manage.py collectstatic`.
8. Configure your WSGI web server (i.e. Apache) to run `./backend/wsgi.py` or run `daphne` and configure proxy.

Run Daphne server with local host access only: `daphne -p 8080 -b 127.0.0.1 backend.asgi:application`.

Terminal should be look like:

```
2023-04-18 13:39:44,352 INFO     Starting server at tcp:port=8080:interface=127.0.0.1
2023-04-18 13:39:44,353 INFO     HTTP/2 support not enabled (install the http2 and tls Twisted extras)
2023-04-18 13:39:44,353 INFO     Configuring endpoint tcp:port=8080:interface=127.0.0.1
2023-04-18 13:39:44,354 INFO     Listening on TCP address 127.0.0.1:8080
```

Now, you can open `http://127.0.0.1:8080/` in web browser.
Please sing in with credentials used on `python manage.py createsuperuser`.

## Update from repo

Please working in conda environment.

1. Pull changes `git pull`.
2. Upgrade dependency `python -m pip install -r ../requirements.txt --upgrade`.
3. Apply changes on database `python manage.py migrate`.
4. Compile frontend `see ../frontend/README.md`.
5. Collect static files `python manage.py collectstatic`.
6. Restart web server (or whole virtual machine).

## Troubleshooting

Known problems.

### Frontend deployment

If `python manage.py collectstatic` ask:

```
You have requested to collect static files at the destination
location as specified in your settings:

    /home/user/webinterface/backend/static_collected

This will overwrite existing files!
Are you sure you want to do this?

Type 'yes' to continue, or 'no' to cancel: 
```

Please enter `yes`.

### Initialize superuser

If you want to set `admin` the django framework raise warning. Please ignore it:
```
The password is too similar to the username.
This password is too short. It must contain at least 8 characters.
This password is too common.
Bypass password validation and create user anyway? [y/N]:
```

Please confirm `y`.
