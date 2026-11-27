---
layout: ../../layouts/DocsLayout.astro
title: The deploy script
description: Each site builds with a plain bash script you can read and change. Here are the defaults, the variables available, and common changes.
---

## How it runs

The deploy script is in the site's **Settings → Deploy script**. During a deploy it runs:

- in the new release's folder, which is also `$SKIFF_SITE_PATH`,
- as the unprivileged `skiff` user, never root,
- with the site's PHP, Composer, Node.js and npm (or Python, uv and the release's `.venv`) first on `PATH`,
- under `set -eo pipefail`, so **the first failing command stops the deploy** and the live site stays as it was.

Output streams to the job log as it runs. **Reset to default** puts back the default script for the site's project type.

## Variables

| Variable | Value |
|---|---|
| `SKIFF_SITE_PATH` | The release being built (the working directory) |
| `SKIFF_RELEASE` | The release's id, such as `20261127093734` |
| `SKIFF_SHARED_PATH` | `/home/skiff/<domain>/shared` |
| `SKIFF_BRANCH` | The branch being deployed |
| `SKIFF_DOMAIN` | The site's domain |
| `SKIFF_PHP`, `SKIFF_NODE`, `SKIFF_PYTHON` | The site's runtime versions |

`COMPOSER_NO_INTERACTION=1` is set as well. Python scripts load the site's `.env` into the environment themselves (see below). Laravel reads `.env` on its own.

## Default for Laravel

```bash
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Drop the previous deploy's cached config and routes
php artisan config:clear
php artisan route:clear

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force
fi

# Frontend assets (Vite etc.)
if [ -f package.json ]; then
    if [ -f package-lock.json ]; then npm ci; else npm install; fi
    npm run build
fi

php artisan migrate --force
php artisan optimize
```

## Default for Node.js apps and static sites

```bash
[ -f package.json ] || { echo "No package.json; nothing to install or build."; exit 0; }

# Install with the package manager the lockfile belongs to.
if [ -f pnpm-lock.yaml ]; then
    PM="npx --yes pnpm"; $PM install --frozen-lockfile
elif [ -f yarn.lock ]; then
    PM="npx --yes yarn"; $PM install --frozen-lockfile
elif [ -f package-lock.json ]; then
    PM=npm; npm ci
else
    PM=npm; npm install
fi

# Build, if package.json has a "build" script.
if node -e "process.exit(require('./package.json').scripts?.build ? 0 : 1)"; then
    $PM run build
fi
```

## Default for Python apps

```bash
# Settings from .env (Django and friends read os.environ)
if [ -f .env ]; then set -a; . ./.env; set +a; fi

# A fresh virtualenv per release, so rollbacks keep their own packages.
uv venv --quiet .venv
export VIRTUAL_ENV="$PWD/.venv" PATH="$PWD/.venv/bin:$PATH"

if [ -f uv.lock ]; then
    uv sync --frozen --no-dev
elif [ -f requirements.txt ]; then
    uv pip install -r requirements.txt
elif [ -f pyproject.toml ]; then
    uv pip install .
fi

# The app server the start command uses
uv pip install gunicorn

# Django: static files and migrations
if [ -f manage.py ]; then
    python manage.py collectstatic --noinput   # when STATIC_ROOT is set
    python manage.py migrate --noinput
fi
```

## Common changes

**Seed on every deploy** (Laravel):

```bash
php artisan db:seed --force
```

**Restart Horizon** instead of using Skiff's queue workers:

```bash
php artisan horizon:terminate
```

**A monorepo**: `cd` into the app's folder first. Static sites can set the output folder to a path inside it, such as `apps/web/dist`.

**Skip a step on some branches**:

```bash
if [ "$SKIFF_BRANCH" = main ]; then
    php artisan migrate --force
fi
```

**Build-time secrets**: put them in the site's `.env`. Laravel reads them during the build; for Node builds, load them first with `set -a; . ./.env; set +a`.

## Upgrades to the default

When a new Skiff version improves a default script, sites still using an older default **unchanged** are upgraded automatically when Skiff starts. Scripts you've edited are never touched.
