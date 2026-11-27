---
layout: ../../layouts/DocsLayout.astro
title: Laravel and PHP
description: PHP versions per site, queue workers, the scheduler, storage and everything else specific to Laravel apps.
---

## PHP versions

Each site picks PHP **8.2, 8.3, 8.4 or 8.5**. New sites default to 8.4, which Laravel 13 needs. A version is installed the first time a site uses it, with FPM, the CLI and these extensions: mbstring, xml, curl, zip, bcmath, intl, sqlite3, mysql, pgsql and gd. `phpredis` is added when a site connects Redis.

- PHP comes from Ubuntu's own packages when Ubuntu ships that version, and from [packages.sury.org](https://packages.sury.org/php/) (the maintained successor of `ppa:ondrej/php`) otherwise. Servers set up with the old PPA are moved over automatically.
- Each version gets its own PHP-FPM pool for the `skiff` user, in `ondemand` mode: no idle workers, so unused versions cost almost nothing.
- During deploys and commands, `php` and `composer` are the site's version.

To change versions, pick another one on the site's Overview. It applies on the next deploy, and the site's Nginx config moves to the matching FPM socket.

### Extra PHP extensions

Install them over SSH for the version you use, then reload FPM:

```bash
sudo apt-get install php8.4-imagick
sudo systemctl reload php8.4-fpm
```

## Queue workers

On a Laravel site's Overview, the **Queue workers & scheduler** card sets:

- **Worker processes** (0–10): each runs `php artisan queue:work` as a systemd service, `skiff-<domain>-worker@N`, as the `skiff` user in the live release, with the site's PHP.
- **Options**: passed to `queue:work`, for example `redis --queue=high,default --tries=3 --timeout=90`.

Workers restart if they crash, and after every deploy, rollback and `.env` change, so they always run the current code. **Restart workers** restarts them by hand.

Using Horizon instead? Set worker processes to 0, run Horizon as a service of your own (see [long-running processes](#octane-reverb-and-other-long-running-processes)), and add `php artisan horizon:terminate` to the end of the deploy script so it restarts on new code.

## The scheduler

Turn on **Scheduler** to run `php artisan schedule:run` every minute through a systemd timer, `skiff-<domain>-schedule.timer`. Its output is on the site's Logs page.

## Storage and files

- `storage/` lives in `shared/storage` and is linked into every release, so uploads, logs and caches survive deploys.
- Run `php artisan storage:link` once from the Commands page if your app serves files from `storage/app/public`.
- Laravel's SQLite database, `database/database.sqlite`, lives in `shared/database/` and is included in backups.

## Caching

The default deploy script runs `config:clear` and `route:clear` before building, then `php artisan optimize` at the end. When you save `.env` in the panel, the config cache is rebuilt for you. If you call `env()` outside config files, those values are frozen by the cache; read them through `config()` instead.

## Vite and frontend assets

If the repository has a `package.json`, the deploy installs the site's Node.js version and runs `npm ci` (or `npm install`) and `npm run build`, so `public/build/manifest.json` exists before the site goes live. Choose **None** for Node.js on the Overview to skip it.

## Octane, Reverb and other long-running processes

Skiff supervises queue workers and the scheduler. For Octane, Reverb or a custom daemon, create a systemd service over SSH, running as `skiff` in `/home/skiff/<domain>/current`, and restart it from your deploy script.

## Common Laravel settings

| `.env` key | Recommended |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://your-domain` |
| `LOG_CHANNEL` | `daily` or `stack` |
| `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION` | `redis` with Redis connected, otherwise `database` |
