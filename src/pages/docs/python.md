---
layout: ../../layouts/DocsLayout.astro
title: Python apps
description: Deploy Django, FastAPI, Flask or any WSGI or ASGI app, with Python installed by uv and a fresh virtualenv for every release.
---

## Frameworks

On **New site**, pick **Django**, **FastAPI**, **Flask** or **Other Python server**, and a Python version: **3.11, 3.12, 3.13 or 3.14**.

| Framework | Default start command |
|---|---|
| Django | `gunicorn "$WSGI_MODULE" --bind "$HOST:$PORT" --workers 2 --access-logfile -` |
| FastAPI | `uvicorn main:app --host "$HOST" --port "$PORT" --workers 2` |
| Flask | `gunicorn app:app --bind "$HOST:$PORT" --workers 2 --access-logfile -` |
| Other Python server | `python main.py`; your app must listen on `$PORT` |

Change the module path (`main:app`, `app:app`) on the site's Overview if your app lives elsewhere.

## How Python is installed

Python comes from [uv](https://docs.astral.sh/uv/). The first Python deploy downloads the uv binary from its GitHub release (checksum-verified) into `/opt/skiff/uv`, and uv installs the chosen Python into `/opt/skiff/python`. Both are owned by root. No apt packages or PPAs are involved, so the system Python is never touched.

## Dependencies

Every release gets its own `.venv`, so a rollback runs with exactly the packages it was built with. The default deploy script installs from:

1. `uv.lock`, with `uv sync --frozen`,
2. otherwise `requirements.txt`,
3. otherwise `pyproject.toml`,

and adds the app server the preset uses (gunicorn or uvicorn).

## Django

The default deploy script:

- runs `collectstatic` when `STATIC_ROOT` is set,
- runs `migrate`.

Also:

- **Static files**: Nginx serves `/static/` from the release's `staticfiles/` folder, Django's usual `STATIC_ROOT`, and passes everything else to the app, so WhiteNoise keeps working too.
- **`ALLOWED_HOSTS`**: add your domain, or read it from `.env`.
- **`$WSGI_MODULE`** is set to the package that holds `wsgi.py`, so the default start command works without editing. Set `WSGI_MODULE` in `.env` to override it.
- **SQLite**: Django's default `db.sqlite3` next to `manage.py` lives in `shared/`, so it survives deploys, and it's backed up.
- **Databases**: with a MySQL or PostgreSQL database, Skiff writes `DATABASE_URL`. Read it with [dj-database-url](https://github.com/jazzband/dj-database-url), and add the driver (`psycopg` or `mysqlclient`) to your requirements.

## Running the app

The start command runs as a systemd service, `skiff-<domain>-app`, as the `skiff` user in the live release, with:

- the release's `.venv` first on `PATH`;
- `PORT` and `HOST=127.0.0.1`;
- the variables in the site's `.env`.

It restarts if it crashes and on every deploy, rollback and `.env` save. If a new release doesn't start, the previous one is put back automatically.

## Background workers

For Celery, RQ or similar, add a systemd service over SSH that runs as `skiff` in `/home/skiff/<domain>/current` with `.venv/bin` on `PATH`, and restart it at the end of your deploy script.
