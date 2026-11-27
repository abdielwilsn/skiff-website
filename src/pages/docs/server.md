---
layout: ../../layouts/DocsLayout.astro
title: Server and services
description: What provisioning installs, how Skiff keeps small servers lean, and the Server page's health view.
---

## Provisioning

**Provision server** on the dashboard installs what every site needs:

- **Nginx**, with Ubuntu's default site removed;
- **PHP 8.4** with FPM and the common extensions, plus **Composer**;
- **Git**, curl, unzip and other basics;
- a **swap file** on servers with less than 2 GB of RAM;
- the unprivileged **`skiff` user** that all sites run as.

It's safe to run again: it only adds what's missing. Everything else is installed the first time it's needed:

| Installed when | What |
|---|---|
| A site picks a PHP version | That PHP version and its FPM pool |
| A site has a `package.json` | That Node.js version, in `/opt/skiff/node` |
| The first Python site | uv and that Python version, in `/opt/skiff` |
| You install it on the Databases page | MySQL, PostgreSQL or Redis |
| The first HTTPS certificate | certbot and its Nginx plugin |

## Built for small servers

Skiff is designed to run comfortably on a 1 GB VPS:

- The panel itself idles at about 16 MB of RAM.
- PHP-FPM pools use `ondemand` workers, so idle sites use no PHP memory.
- MySQL and PostgreSQL are tuned down on machines with less than 2 GB of RAM.
- Jobs (deploys, backups, installs) run one at a time, so two builds never compete for memory.
- `node_modules` is removed from releases that aren't live.

## Server health

The **Server** page shows:

- CPU, memory, swap and disk use, load and uptime, with a 24-hour chart of each (sampled every minute and kept in memory, so it starts over when Skiff restarts);
- whether Nginx, PHP-FPM, MySQL, PostgreSQL, Redis and every site process (app servers, queue workers, schedulers) are running.

The dashboard repeats the key numbers and warns when the disk is over 85% full, memory is over 90% used, or a service has failed.

## Services Skiff manages

| Service | Name |
|---|---|
| The panel | `skiff` |
| A Node or Python app | `skiff-<domain>-app` |
| Laravel queue workers | `skiff-<domain>-worker@1`, `@2`… |
| Laravel scheduler | `skiff-<domain>-schedule.timer` |

Use the usual tools over SSH:

```bash
systemctl status skiff-example.com-app
systemctl restart 'skiff-example.com-worker@*'
journalctl -u skiff -n 100
```

## System updates

Skiff doesn't upgrade the operating system for you. Ubuntu installs security updates on its own with `unattended-upgrades` (on by default). For everything else, run now and then:

```bash
sudo apt update && sudo apt upgrade
```

Reboot when Ubuntu asks for it (`/var/run/reboot-required` exists). All of Skiff's services start again on boot.
