---
layout: ../../layouts/DocsLayout.astro
title: Updating Skiff
description: Update the panel by running the install command again. Your sites keep running throughout.
---

## Update

On the server, run the same command you installed with:

```bash
curl -fsSL https://raw.githubusercontent.com/abdielwilsn/skiff/main/scripts/install.sh | sudo bash
```

It downloads the newest release, checks its SHA-256 checksum, replaces the binary and restarts the panel. If you're already on the newest version, it does nothing.

- Your data in `/var/lib/skiff`, your settings and the service file are kept.
- **Sites keep serving** during the update: they run from Nginx, PHP-FPM and their own services, not from the panel.
- A job that was running when the panel restarted is marked as failed. Run it again.

## Which version am I on?

The version is shown under your username at the bottom of the panel's sidebar, or:

```bash
skiff version
```

Releases and their notes are on [GitHub](https://github.com/abdielwilsn/skiff/releases).

## Installing a specific version

To install a particular release, or go back to an earlier one:

```bash
curl -fsSL https://raw.githubusercontent.com/abdielwilsn/skiff/main/scripts/install.sh | sudo bash -s -- --version v0.4.2
```

Prefer going forward: if a release has a problem, the next one fixes it. If you do go back, take a backup of `/var/lib/skiff` first.

## What updates change on their own

Some releases improve things on existing servers when they first start:

- **Default deploy scripts** that you never edited are upgraded to the new default. Edited ones are left alone.
- **Configuration Skiff manages**, such as the panel's proxy, may be updated in a background job. You'll see it in the dashboard's activity list.
- **Release notes** say when something needs you, such as re-saving a setting.
