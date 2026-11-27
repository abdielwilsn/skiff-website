---
layout: ../../layouts/DocsLayout.astro
title: Commands and logs
description: Run one-off commands in a site and read its logs from the browser, without opening SSH.
---

## Running commands

Each site has a **Commands** page with a text box and one-click presets for its project type:

| Project | Presets include |
|---|---|
| Laravel | `migrate`, `migrate:status`, `db:seed`, `migrate:rollback`, `queue:restart`, `optimize:clear`, `storage:link` |
| Node.js | `node -v`, `npm run`, `npm outdated`, `npm ls` |
| Python | `uv pip list`, Django `migrate`, `showmigrations`, `check --deploy`, `collectstatic` |

Commands:

- run in the site's live release as the `skiff` user, with the site's PHP, Node.js or Python first on `PATH`, the same environment as the deploy script;
- can span several lines, running as a bash script that stops at the first failure;
- run without a terminal, so prompts get their default answer. Pass `--force` where Artisan asks for it in production;
- stream their output live and are kept in the site's history, with **Use again**.

Destructive commands such as `migrate:fresh`, `db:wipe` or `rm -rf` ask for confirmation first.

> Commands run as the site, not as root. For server administration (installing packages, editing system files), use SSH.

## Logs

The site's **Logs** page shows:

- **App**: the output of a Node.js or Python app's service, from the systemd journal.
- **Workers and scheduler**: the output of Laravel queue workers and `schedule:run`.
- **laravel.log**: the end of `storage/logs/laravel.log`, read as the `skiff` user.

Deploy logs are on the **Deployments** page, one per deploy, and every job (backups, restores, provisioning) has its own log page, linked from the dashboard's activity list.

### On the server

The same logs over SSH:

```bash
journalctl -u skiff-example.com-app -f            # a Node/Python app
journalctl -u 'skiff-example.com-worker@*' -f     # queue workers
journalctl -u skiff -f                            # the panel itself
tail -f /home/skiff/example.com/shared/storage/logs/laravel.log
ls /var/lib/skiff/logs/                           # every job's log
```
