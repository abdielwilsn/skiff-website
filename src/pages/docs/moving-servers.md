---
layout: ../../layouts/DocsLayout.astro
title: Moving to a new server
description: A step-by-step guide to moving apps to a Skiff server, from another Skiff server or from Forge, Ploi, a shared host or anywhere else, with a short switch-over window.
---

The plan is to set everything up on the new server while the old one keeps serving traffic, copy the data last, then point DNS at the new server.

## 1. Prepare the new server

1. [Install Skiff](/docs/installation) and provision the server.
2. Give the panel its domain and [connect GitHub](/docs/github).
3. Create each site with its repository, branch and runtime versions, and tick **Database** if the app uses MySQL or PostgreSQL. Use the real domain: the site deploys and waits, and nothing reaches it until DNS points there.

## 2. Copy the configuration

For each site, open **Env variables** and paste the old server's `.env`. Keep the database lines Skiff wrote (`DB_*` or `DATABASE_URL`), since the new database has its own user and password, and the Redis lines if you connected Redis. Save, then press **Deploy** so the build uses the real settings.

## 3. Lower the DNS TTL

At your DNS provider, lower the TTL of the domains' records to a few minutes, a day ahead if you can, so the switch takes effect quickly.

## 4. Copy the data

Plan a short maintenance window. On the old server, stop writes, for example with `php artisan down`, then dump each database:

```bash
mysqldump --single-transaction --routines --triggers my_db | gzip > my_db.sql.gz
# or: pg_dump -Fc my_db > my_db.dump
```

Copy the dumps to the new server and [import them](/docs/importing):

```bash
scp my_db.sql.gz root@new-server:/var/backups/skiff/imports/
```

Then **Backups → Import** → **A file already on the server**.

Copy uploaded files too, if the app keeps them on disk:

```bash
# on the new server
rsync -a root@old-server:/path/to/app/storage/app/ /home/skiff/example.com/shared/storage/app/
chown -R skiff:skiff /home/skiff/example.com/shared/storage
```

## 5. Switch DNS

Point the domains' A records at the new server. Once they resolve to it (`dig +short example.com`), [enable HTTPS](/docs/https) on each site. Let's Encrypt can only issue the certificate once the domain points at the new server.

Keep the old server running for a day or two, read-only, in case anything was missed.

## 6. Finish up

- Turn on push-to-deploy for each site, and remove the old server's webhooks from GitHub.
- Set up [off-site backups](/docs/backups#off-site-storage).
- Move cron jobs and queue workers: on Laravel sites, turn on the scheduler and set the worker count.
- Raise the DNS TTL again.

## From another Skiff server

The same steps, with a shortcut for the data: on the old server's **Backups** page, press **Back up now**, then **Download** each database's newest backup and upload it on the new server's import page. Or copy the files directly between servers:

```bash
# on the new server
scp root@old-server:/var/backups/skiff/mysql-app_example_com/20261127-030000-manual.sql.gz /var/backups/skiff/imports/
```

## From Forge, Ploi or RunCloud

These panels use the same building blocks as Skiff (Nginx, PHP-FPM, MySQL or PostgreSQL), so apps move without code changes:

- **Deploy scripts**: Skiff's default Laravel script covers the usual steps. Copy across any custom steps you added.
- **Daemons**: queue workers map to Skiff's worker count and options. Horizon and other daemons need a [service of their own](/docs/laravel#octane-reverb-and-other-long-running-processes).
- **Scheduler**: turn it on in the site's Overview instead of a cron entry.
- **Database backups**: the `.sql.gz` files these panels produce import directly.
