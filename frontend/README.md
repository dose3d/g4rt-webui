# Frontend

JavaScript application.

Tested on node v18.15.0 and npm v9.6.3.

## Prepare for usage

Install packages and build:

1. Go to dir with fork of JSROOT: `cd ../jsroot-fork`.
2. Install packages: `npm install`.
3. Build: `npm run build`.
4. Back to this dir `cd ../frontend`.
5. Install packages: `npm install`.
6. Build: `npm run build`.

## Upgrade from repo

1. Pull changes `git pull`.
2. Install or upgrade dependency: `npm install`.
3. Build: `npm run build`.
4. Go to backend `cd ../backend` and run `python manage.py collectstatic` for deploy new build.
