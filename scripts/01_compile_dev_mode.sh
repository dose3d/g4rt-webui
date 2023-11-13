#!/bin/bash

set -e

PWD=`pwd`

echo
echo -------------------------------------------------------------------------
echo Compile frontend...
echo -------------------------------------------------------------------------
echo
cd ../frontend
npm run build

echo
echo -------------------------------------------------------------------------
echo Run database migration scripts
echo -------------------------------------------------------------------------
echo

cd ../backend
python manage.py migrate

echo
echo -------------------------------------------------------------------------
echo Done, you can run 01_compile_dev_mode.sh script
echo -------------------------------------------------------------------------
cd $PWD
