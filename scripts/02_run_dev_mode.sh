#!/bin/bash

set -e

PWD=`pwd`
PORT=8080

echo
echo -------------------------------------------------------------------------
echo Run backend on $PORT port
echo -------------------------------------------------------------------------
echo

cd ../backend
python manage.py runserver 0.0.0.0:$PORT
cd $PWD
