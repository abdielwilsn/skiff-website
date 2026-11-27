---
layout: ../../layouts/DocsLayout.astro
title: Installation
description: Install Skiff on a fresh Ubuntu server with one command, then create your admin account over HTTPS.
---

## Before you start

You need a fresh **Ubuntu 22.04 or 24.04** server (x86-64 or ARM) and root access. Any VPS provider works: Hetzner, DigitalOcean, Vultr, Linode, AWS Lightsail, Oracle Cloud and so on.

If your provider has a firewall, open these ports:

| Port | For |
|---|---|
| 22 | SSH |
| 80, 443 | Your sites, and Let's Encrypt's checks |
| 8090 | The panel, until you give it its own domain |

A server that already runs other software works too, but Skiff expects to manage Nginx and PHP-FPM, so a fresh one is simplest.

## Install

SSH into the server and run:

```bash
curl -fsSL https://raw.githubusercontent.com/abdielwilsn/skiff/main/scripts/install.sh | sudo bash
```

The installer:

1. Downloads the latest release for your CPU from GitHub and checks its SHA-256 checksum.
2. Installs the binary to `/usr/local/bin/skiff`.
3. Creates the `skiff` systemd service, with its data in `/var/lib/skiff`.
4. Prints a one-time setup link and the panel's certificate fingerprint.

```
==> Skiff v0.4.2 is running.
Finish setup at: https://203.0.113.7:8090/setup?token=…
Your browser will warn once. Check that the certificate's SHA-256 fingerprint is:
  25:EF:0C:DA:…
```

### Options

Pass options after `bash -s --`:

```bash
# A specific release
curl -fsSL https://raw.githubusercontent.com/abdielwilsn/skiff/main/scripts/install.sh | sudo bash -s -- --version v0.4.2
# Another port for the panel (fresh installs only)
curl -fsSL https://raw.githubusercontent.com/abdielwilsn/skiff/main/scripts/install.sh | sudo bash -s -- --port 9000
```

## Create the admin account

Open the setup link. The panel's port uses HTTPS from the very first visit, with a self-signed certificate, so the setup token and your password are always encrypted.

Your browser shows a warning the first time. Before accepting it, compare the certificate's SHA-256 fingerprint (click the warning's details, or the padlock) with the one the installer printed. If you lost it, run:

```bash
sudo skiff tls-fingerprint
```

To skip the warning entirely, open an SSH tunnel and use plain HTTP on your own machine:

```bash
ssh -L 8090:localhost:8090 root@203.0.113.7
# then open http://localhost:8090/setup?token=…
```

The setup page asks for a username and a password of at least 10 characters. The setup token only works once. If you lose it before finishing, run `sudo skiff reset-admin` to print a new link.

> Once you're in, give the panel [its own domain](/docs/panel) so it gets a trusted certificate, and turn on [two-factor login](/docs/security#two-factor-login).

## What's on the server afterwards

| Path | What |
|---|---|
| `/usr/local/bin/skiff` | The Skiff binary |
| `/etc/systemd/system/skiff.service` | Its service (`systemctl status skiff`) |
| `/var/lib/skiff/` | Skiff's database, job logs and panel certificate (root only) |
| `/home/skiff/<domain>/` | Each site's releases and shared files |
| `/var/backups/skiff/` | Database backups (root only) |

Nothing else is installed until you press **Provision server** in the panel. That's the [next step](/docs/first-deploy).

## Uninstalling

Skiff doesn't remove what it installed for your sites. To remove the panel itself:

```bash
sudo systemctl disable --now skiff
sudo rm /etc/systemd/system/skiff.service /usr/local/bin/skiff
sudo rm -rf /var/lib/skiff   # Skiff's settings and history
```

Your sites keep running from Nginx and systemd, and their files stay in `/home/skiff`.
