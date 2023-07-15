#!/bin/bash

screen -AdmS webinterface -t runner bash /home/geant4/webinterface/runner/run.sh
screen -S webinterface -X screen -t backend bash /home/geant4/webinterface/backend/run.sh
