# 
# This is dockerfile to build an image for dose3d cross-project environment
# 
# Build locally:
# docker build --tag 'g4rt:v1r0' . -f docker/g4rt.Dockerfile
#
# RunInteractively and Remove it Once the Process is Complete
# docker run -it --rm g4rt:v1r0 /bin/bash

FROM brachwal/ubuntu-g4:22.04-11.1.3-1.0

LABEL com.example.version="0.0.1-beta"

RUN DEBIAN_FRONTEND=noninteractive && \
  wget --no-check-certificate https://repo.anaconda.com/miniconda/Miniconda3-py310_23.9.0-0-Linux-x86_64.sh -O /opt/miniconda.sh && \
  /bin/bash /opt/miniconda.sh -b -p /opt/conda && \
  rm /opt/miniconda.sh

RUN conda init && \
    /bin/bash && \ 
    conda env create -f /opt/geant4-g4rt-environment.yml

RUN cd /opt/geant4-data && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4NDL.4.7.tar.gz; tar -xzvf G4NDL.4.7.tar.gz; rm G4NDL.4.7.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4EMLOW.8.5.tar.gz; tar -xzvf G4EMLOW.8.5.tar.gz; rm G4EMLOW.8.5.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4PhotonEvaporation.5.7.tar.gz; tar -xzvf G4PhotonEvaporation.5.7.tar.gz; rm G4PhotonEvaporation.5.7.tar.gz&& \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4RadioactiveDecay.5.6.tar.gz; tar -xzvf G4RadioactiveDecay.5.6.tar.gz; rm G4RadioactiveDecay.5.6.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4PARTICLEXS.4.0.tar.gz; tar -xzvf G4PARTICLEXS.4.0.tar.gz; rm G4PARTICLEXS.4.0.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4PII.1.3.tar.gz; tar -xzvf G4PII.1.3.tar.gz; rm G4PII.1.3.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4RealSurface.2.2.tar.gz; tar -xzvf G4RealSurface.2.2.tar.gz; rm G4RealSurface.2.2.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4SAIDDATA.2.0.tar.gz; tar -xzvf G4SAIDDATA.2.0.tar.gz; rm G4SAIDDATA.2.0.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4ABLA.3.3.tar.gz; tar -xzvf G4ABLA.3.3.tar.gz; rm G4ABLA.3.3.tar.gz && \
    wget --no-check-certificate https://cern.ch/geant4-data/datasets/G4ENSDFSTATE.2.3.tar.gz; tar -xzvf G4ENSDFSTATE.2.3.tar.gz; rm G4ENSDFSTATE.2.3.tar.gz


RUN . /opt/conda/etc/profile.d/conda.sh && \
    conda activate geant4 && \
    cd; git clone --single-branch --branch develop https://github.com/dose3d/g4rt.git && \
    mkdir g4rt/build; cd g4rt/build; cmake ../; make -j2
	
COPY g4rt-webui-be/runner /app/runner
COPY ./dose3d_commons /app/dose3d_commons
COPY config.txt.docker /app/config.txt

# Envs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN . /opt/conda/etc/profile.d/conda.sh && \
    conda activate geant4 && \
	cd /app/dose3d_commons && \
	pip install -e .
	
WORKDIR /app/runner
CMD ["conda", "run", "--no-capture-output", "-n", "geant4", "python", "main.py"]
