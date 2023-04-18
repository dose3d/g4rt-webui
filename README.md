# geant4-rt Web Interface

Runner, backend and frontend for **geant4-rt**.

* Runner - work as daemon, consume jobs from backend and launch dose4-rt.
* Backend - manage jobs and serve frontend for web browser.
* Frontend - GUI in web browser.

## Installation on Ubuntu 20.04 with compiled geant4-rt 

How to install and execute Web Interface on WSL2 with Ubuntu 20.04 with configured **geant4-rt**:

First: Setup the **cmvfs** env with running and activate conda environment:

```
source setup-cvmfs-ubuntu2004.sh
conda activate g4rt-env
```

And next:

### 1. Clone repo

```
git clone https://git.plgrid.pl/scm/tnd3d/webinterface.git
cd webinterface
```

### 2. Configure: `config.txt`

```cp config.txt.sample config.txt``` 

If you compile **dose3d** in `/home/user/dose3d-geant4-linac/build` you can set `DOSE3D_EXEC`: 

```DOSE3D_EXEC=/home/user/dose3d-geant4-linac/build/executables/run-toml-mode```
 
Other settings can be copied from `config.txt.sample` file.

Full example of `config.txt`:
```
QUEUE_DIR=../var/dose3d/queue
RUNNING_DIR=../var/dose3d/running
DONE_DIR=../var/dose3d/done
DOSE3D_EXEC=/home/user/dose3d-geant4-linac/build/executables/run-toml-mode
SLEEP=1
```

### 3. Install dependency libraries for Web Interface
 
```
python -m pip install -r requirements.txt
```

### 4. Build **Frontend**

```
cd frontend
npx npm install
npx npm run build

# go to Backend dir:
cd ../backend
python manage.py collectstatic
```

If ask:
```
You have requested to collect static files at the destination
location as specified in your settings:

    /home/user/webinterface/backend/static_collected

This will overwrite existing files!
Are you sure you want to do this?

Type 'yes' to continue, or 'no' to cancel: 
```

Please enter `yes`.

### 5. Initialize **Backend** database

```
# in Backend dir:
python manage.py migrate
python manage.py createsuperuser --username admin --email admin@admin.com
```

Please set password `admin` and when you see the warning:
```
The password is too similar to the username.
This password is too short. It must contain at least 8 characters.
This password is too common.
Bypass password validation and create user anyway? [y/N]:
```

Please confirm `y`.

## Run **Runner** and **Backend**

In two separated terminals you must launch **Runner** and **Backend**

### Launch **Runner** 

In separated terminal please setup **cmvfs** and conda:

```
cd dose3d-geant4-linac
source setup-cvmfs-ubuntu2004.sh
conda activate g4rt-env
cd ..

# and launch Runner:
cd webinterface/runner
python main.py
```

Terminal should be look like:

```
Load config from: /home/user/webinterface/config.txt
Used config settings:
QUEUE_DIR = /home/user/webinterface/var/dose3d/queue
RUNNING_DIR = /home/user/webinterface/var/dose3d/running
DONE_DIR = /home/user/webinterface/var/dose3d/done
DOSE3D_EXEC = /home/user/dose3d-geant4-linac/build/executables/run-toml-mode
SLEEP = 1

Start loop QUEUE_DIR crawler loop...
```

### Launch **Backend** 

In separated terminal please setup **cmvfs** and conda:

```
cd dose3d-geant4-linac
source setup-cvmfs-ubuntu2004.sh
conda activate g4rt-env
cd ..

# and launch web server with Backend:
cd webinterface/backend
daphne -p 8080 -b 127.0.0.1 backend.asgi:application
# you can use another free TCP port instead 8080
```

Terminal should be look like:

```
2023-04-18 13:39:44,352 INFO     Starting server at tcp:port=8080:interface=127.0.0.1
2023-04-18 13:39:44,353 INFO     HTTP/2 support not enabled (install the http2 and tls Twisted extras)
2023-04-18 13:39:44,353 INFO     Configuring endpoint tcp:port=8080:interface=127.0.0.1
2023-04-18 13:39:44,354 INFO     Listening on TCP address 127.0.0.1:8080
```

Now, you can open `http://127.0.0.1:8080/` in web browser. Please sing in with credentials used on `python manage.py createsuperuser`.

## How to update Web Interface

For update Web Interface you must:
* close **Runner** and **Backend** instance,
* pull changes from git,
* install new dependency for python,
* compile **Frontend**,
* run database migration scripts,
* run **Runner** and **Backend** again.

```
# Pull changes from git:
cd webinterface
git pull

# Install new dependency for python:
python -m pip install --upgrade -r requirements.txt

# Install new depenedncy for JavaScript and recompile frontend:
cd frontend
npx npm install 
npx npm run build 

# go to Backend dir and collectstatic again:
cd ../backend
python manage.py collectstatic

# apply database migrations script:
python manage.py migrate
```

Now you can run **Runner** and **Backend** again.
