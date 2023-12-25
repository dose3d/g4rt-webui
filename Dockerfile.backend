# Phase 1: build frontend
FROM node:20-bookworm as build
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    libxi-dev libglu1-mesa-dev libglew-dev \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /jsroot-fork
COPY ./jsroot-fork /jsroot-fork
RUN npm install
RUN npm run build

WORKDIR /app
COPY ./frontend /app
RUN npm install
RUN npm run build

# Phase 2: build backend image
FROM python:3.11
LABEL authors="Michał Niedźwiecki"

WORKDIR /app
COPY --from=build /app/build /app/frontend/build

# Copy python files
COPY requirements.txt .
COPY config.txt.docker ./config.txt
COPY ./dose3d_commons /app/dose3d_commons
COPY ./backend /app/backend
COPY ./backend/backend/settings_local.py.docker /app/backend/backend/settings_local.py
RUN pip install --no-cache-dir -r requirements.txt

# Envs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app/backend
RUN python manage.py collectstatic

# Daphne server
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
