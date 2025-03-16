# geant4-rt Web Interface

Runner, backend and frontend for **geant4-rt**.

* Runner - work as daemon, consume jobs from backend and launch dose4-rt.
* Backend - manage jobs and serve frontend for web browser.
* Frontend - GUI in web browser.

## Development environment setup

There is development version of `docker-compose.yml` located in `dev` directory that sets up development environment. This environment consists of 3 containers: db, frontend and backend. 

Frontend and backend are served by development servers supporting hot-reload feature, meaning that any changes in source code are automatically picked up and applied in working application without the need of rebuilding anything. `backend`, `frontend` and `jsroot-fork` servers are attached to containers as volumes, which enable developer to edit files on host, and servers will pick up changes.

To launch this environment run `cd dev && docker compose up -d`

To see dev server logs run `docker logs <container_name> --follow`

## Installation on Ubuntu 20.04 with compiled geant4-rt 

How to install and execute Web Interface on WSL2 with Ubuntu 20.04 with configured **geant4-rt**:

The web application requires python and postgresql for running the **Backend** and **Runner** and nodejs for build the **Frontend**.

Python should be installed with `conda` environment for `dose3d`.

The `nodejs` can be installed from Ubuntu repo recommend to install from official PPA repository because you will install new version:

```
$ curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
$ sudo bash nodesource_setup.sh
$ sudo apt install nodejs
```

### 1. Clone repo

```
git clone https://git.plgrid.pl/scm/tnd3d/webinterface.git
cd webinterface
```

### 2. Configure: `config.txt`

The `config.txt` file contains settings for **Runner** and **Backend** applications.
In this file you must configure directiory for jobs files and dose3d-geant4-linac execution.

Please use sample of settings and modify:

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

### 3. Configure and build applications

See `backend/README.md`.

## Run **Runner** and **Backend**

For development you can run **Runner** and **Backend** in separated terminals.

Please look on `run_in_screen.sh` file. Its launch **Runner** and **Backend** in **screen** terminal.

## Upgrade from repo

See `backend/README.md` for upgrade **Backend** and **Frontend**.

Next, restart **Runner**.

