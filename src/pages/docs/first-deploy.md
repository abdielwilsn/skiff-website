---
layout: ../../layouts/DocsLayout.astro
title: Your first deploy
description: From a freshly installed panel to a live site, in four steps.
---

This walks through deploying a Laravel app. JavaScript and Python apps follow the same steps; only the framework you pick differs.

## 1. Provision the server

On the dashboard, press **Provision server**. Skiff installs and configures:

- Nginx, with the default site removed.
- PHP 8.4 with FPM, the CLI and the extensions Laravel needs (mbstring, xml, curl, zip, bcmath, intl, gd, sqlite3, mysql, pgsql).
- Composer and Git.
- A swap file, on servers with less than 2 GB of RAM.
- The unprivileged `skiff` user that every site runs as.

It takes a minute or two, and you can watch the log as it runs. Provisioning is safe to run again; it skips what's already in place. Node.js, Python, databases and certbot are installed later, the first time a site needs them.

## 2. Give the panel a domain (recommended)

In **Settings → Panel address & HTTPS**, enter a domain such as `panel.example.com` whose DNS points at the server. Skiff puts the panel behind Nginx at that domain with a Let's Encrypt certificate.

Do this before connecting GitHub: the GitHub app's callback URL and push-to-deploy webhooks use the panel's address. See [The panel's address](/docs/panel).

## 3. Connect GitHub

In **Settings → GitHub**, register a GitHub OAuth app, paste its Client ID and secret, and press **Connect GitHub**. The page shows the exact homepage and callback URLs to use. [Connecting GitHub](/docs/github) has the details, including organization repositories.

## 4. Deploy a repository

Open **Repositories** and press **Deploy** next to your app, or use **New site**:

- **Repository and branch**: the branch to deploy, such as `main`.
- **Framework**: sets the project type and good defaults (deploy script, start command, output folder). Everything stays editable.
- **Domain**: a domain whose A record points at the server, or the server's IP address to try things out.
- **Versions**: PHP for Laravel, Node.js for anything with a `package.json`, Python for Python apps.
- **Database**: optionally create a MySQL or PostgreSQL database for the site; its settings are written into `.env` before migrations run.
- **Redis**: optionally connect the server's Redis.

Press **Deploy**. The first deploy starts right away and streams its log. When it finishes, open the domain.

## Next steps

- **HTTPS**: on the site's **Settings** page, press **Enable HTTPS**. See [Domains and HTTPS](/docs/https).
- **Push to deploy**: in **Settings → Git**, turn on auto-deploy so every push to the branch deploys.
- **Environment variables**: edit the site's `.env` on its **Env variables** page. See [Environment variables](/docs/environment-variables).
- **Queue workers and the scheduler**: on a Laravel site's Overview. See [Laravel and PHP](/docs/laravel).
- **Backups**: they're on by default for every database. Add off-site storage on the **Backups** page. See [Backups and restores](/docs/backups).
