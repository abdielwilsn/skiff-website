---
layout: ../../layouts/DocsLayout.astro
title: Troubleshooting
description: Fixes for the problems people run into most, from failed deploys to lost logins.
---

Every job has a log. Start there: the last lines usually name the problem.

## Deploys

### The deploy failed

The live site is unchanged; a failed deploy never switches over. Open the deploy's log from the **Deployments** page and look at the last command that ran:

- **`composer install` or `npm ci` failed**: usually a lockfile that's out of date with `composer.json` or `package.json`, or a package that needs a newer runtime. Commit an updated lockfile, or change the PHP or Node.js version on the Overview.
- **Killed, or out of memory**: the build needs more RAM than the server has. Make sure swap is on (provisioning adds it below 2 GB), or build assets in CI and commit them.
- **`php artisan migrate` failed**: fix the migration and deploy again. Nothing was switched, and the backup taken before the deploy is on the Backups page.

### The app didn't start (Node.js or Python)

Skiff put the previous release back. The log ends with the app's last output. Common causes:

- The app doesn't listen on `$PORT`, or listens on a fixed port.
- The start command is wrong for the framework. Check the build's output folder, such as `.output` or `dist`.
- A variable the app needs at startup is missing from `.env`.

### Push to deploy doesn't trigger

- The panel needs [a domain with HTTPS](/docs/panel). GitHub doesn't deliver webhooks to self-signed addresses.
- In the repository's **Settings → Webhooks** on GitHub, open the hook's **Recent Deliveries** to see GitHub's error.
- Only pushes to the site's own branch deploy.

### A repository isn't listed

If it belongs to an organization, the organization may restrict OAuth apps. See [Organization repositories](/docs/github#organization-repositories). Then press **Refresh** on the Repositories page.

## Sites

### 502 Bad Gateway

Nginx can't reach the app or PHP-FPM:

- **Node.js or Python**: the app is stopped or crashing. Check the site's **Logs** page, or `journalctl -u skiff-<domain>-app`.
- **Laravel**: PHP-FPM for the site's version isn't running: `systemctl status php8.4-fpm`.

### 500 error on a Laravel site

Look at `laravel.log` on the site's Logs page. Typical causes are a missing `APP_KEY` (the default deploy script generates one), wrong database settings in `.env`, or `storage/` not writable. Running `php artisan optimize:clear` from Commands helps when a cached config is stale.

### 404 for everything but the home page (static sites)

Check the **output folder** on the Overview matches where the build writes. Client-side routes fall back to `index.html` automatically.

## HTTPS

### Enable HTTPS fails

- The domain must point at this server. Check with `dig +short your-domain`.
- Port 80 must be open to the internet; Let's Encrypt checks over HTTP.
- With Cloudflare's proxy on, see [Behind Cloudflare](/docs/https#behind-cloudflare).
- Let's Encrypt limits how many certificates a domain can get per week. If you hit the limit, wait, or test against the staging server first.

## Installing PHP

### "Unable to locate package php8.x-fpm"

Skiff before v0.4.2 used `ppa:ondrej/php`, which is frozen and has no packages for Ubuntu 26.04. Update Skiff by running the install command again; it moves the server to packages.sury.org and installs PHP from there.

## Databases

### Can't connect from my computer

Databases only listen on localhost. Use an [SSH tunnel](/docs/databases#connecting-from-your-computer).

### An import failed

See [If an import fails](/docs/importing#if-an-import-fails). The safety backup taken before the import is on the Backups page.

## The panel

### I forgot my password

```bash
sudo skiff reset-admin
```

It prints a new setup link to create the account again. Your sites, settings and GitHub connection are kept.

### I lost my two-factor device

```bash
sudo skiff disable-2fa
```

### The panel's domain stopped working

```bash
sudo skiff reset-panel-domain
```

The panel answers on `https://IP:8090` again.

### The panel isn't responding

```bash
systemctl status skiff
journalctl -u skiff -n 100
sudo systemctl restart skiff
```

Sites keep running while the panel is down.

## Still stuck?

Search or open an issue on [GitHub](https://github.com/abdielwilsn/skiff/issues). Include the job's log, your Ubuntu version and `skiff version`, but remove secrets first.
