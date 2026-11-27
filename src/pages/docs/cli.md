---
layout: ../../layouts/DocsLayout.astro
title: Command line
description: The skiff command on the server, for recovery and the few things that don't belong in the browser.
---

Run these on the server as root (with `sudo`). The panel's service runs `skiff serve`; the other commands work while it's running.

## Recovery

| Command | What it does |
|---|---|
| `skiff reset-admin` | Removes the admin account and prints a new `/setup?token=…` link to create one. Use it if you forget your password. No restart needed. |
| `skiff disable-2fa` | Turns off two-factor login for the admin. Use it if you've lost your phone and your recovery codes. |
| `skiff reset-panel-domain` | Stops redirecting the panel to its domain, so it answers on `https://IP:8090` again. Use it if the panel's domain stops working. |
| `skiff tls-fingerprint` | Prints the SHA-256 fingerprint of the panel's self-signed certificate, to check against your browser's warning. |

## Information

| Command | What it does |
|---|---|
| `skiff version` | Prints the installed version. |
| `skiff help` | Lists the commands. |

## Internal

| Command | What it does |
|---|---|
| `skiff env-exec FILE CMD…` | Runs `CMD` with the variables in `FILE` (a `.env`). App services use it, as the site user, so the file is read with that user's permissions. |

## `skiff serve`

The panel itself. The installer sets up its service, so you rarely run this by hand.

| Flag | Environment | Default | What it does |
|---|---|---|---|
| `--addr` | `SKIFF_ADDR` | `:8090` | The address and port to listen on |
| `--data` | | `/var/lib/skiff` | Where Skiff keeps its database, logs and certificate |
| `--url` | `SKIFF_URL` | from each request | The panel's public URL, when you run your own reverse proxy |
| `--acme-server` | `SKIFF_ACME_SERVER` | Let's Encrypt | Another ACME server, such as Let's Encrypt's staging server for testing |
| `--dry-run` | `SKIFF_DRY_RUN=1` | off | Prints server commands instead of running them, for working on the UI locally |

To change a flag on the server, edit the service:

```bash
sudo systemctl edit skiff --full
sudo systemctl restart skiff
```
