---
layout: ../../layouts/DocsLayout.astro
title: Creating and managing sites
description: A site is one app from one repository branch, served at one domain. Here's what you choose when you create one and what each of its pages does.
---

## Creating a site

Use **New site**, or **Deploy** next to a repository on the **Repositories** page.

| Field | What it does |
|---|---|
| **Repository** | `owner/name` or a GitHub URL. Private repositories work once [GitHub is connected](/docs/github). |
| **Branch** | The branch every deploy fetches, such as `main`. |
| **Framework** | Picks the project type and defaults: Laravel, a Node.js framework, a static-site builder, or a Python framework. |
| **Domain** | A domain pointing at the server, or the server's IP address for a quick test. One site per domain. |
| **PHP / Node.js / Python** | The runtime versions this site uses. Each is installed the first time a site needs it. |
| **Start command** | Node and Python apps: the command that starts the server. It must listen on `$PORT`. |
| **Output folder** | Static sites: the folder the build writes, such as `dist`. |
| **Database** | Create a MySQL or PostgreSQL database for the site. |
| **Redis** | Connect the server's Redis, with a key prefix of the site's own. |

The domain and branch are fixed once the site exists. To serve the app at another domain or from another branch, add an [environment](/docs/environments) or create a new site.

### Using the server's IP

Using the IP address as the domain is handy for a first try. A server has one IP, so only one site can use it, and HTTPS needs a real domain. You can also use a `.test` domain together with your computer's hosts file.

## The site's pages

Each site has a sidebar with these pages:

- **Overview**: status, the live commit, runtime versions, and settings for its processes: queue workers and the scheduler for Laravel, the start command for apps, the output folder for static sites. Also the Redis connection.
- **Deployments**: the deploy history with logs, the kept releases, and **Roll back**. See [How deploys work](/docs/deploys).
- **Environments**: staging and other environments of this site. See [Staging and environments](/docs/environments).
- **Env variables**: the site's `.env`. See [Environment variables](/docs/environment-variables).
- **Commands**: run Artisan, npm, Django or shell commands in the site. See [Commands and logs](/docs/commands-and-logs).
- **Logs**: app, worker and scheduler output, and `laravel.log`.
- **Settings**: push-to-deploy, domain and HTTPS, the deploy script, and deleting the site.

## Changing runtime versions

On the Overview, change the PHP, Node.js or Python version and save. The change takes effect on the next deploy: Skiff installs the version if needed, builds with it, and points the site's Nginx config at the matching PHP-FPM pool.

## Files on the server

```
/home/skiff/<domain>/
  current -> releases/20261122141530   the live release
  releases/<id>/                        the last five releases
  shared/.env                           kept across deploys
  shared/storage/                       Laravel's storage folder
  shared/database/database.sqlite       Laravel's SQLite database, if used
```

Everything belongs to the `skiff` user. Nginx configs live in `/etc/nginx/sites-available/<domain>`, and app services are named `skiff-<domain>-app`, `skiff-<domain>-worker@N` and `skiff-<domain>-schedule`.

You can edit a site's Nginx config by hand. Skiff keeps your edits (and certbot's) when it changes the PHP version or HTTPS settings.

## Deleting a site

**Settings → Delete site** (type the domain to confirm) removes:

- the site's folder, including `.env` and any SQLite database in it,
- its Nginx config, certificate and services,
- the push-to-deploy webhook on GitHub.

Your repository is untouched, and so is the site's MySQL or PostgreSQL database: it's detached and stays on the **Databases** page until you delete it there. Back up anything in `shared/` you want to keep first. A production site with other environments can't be deleted until those are deleted.
