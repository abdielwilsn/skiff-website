---
layout: ../../layouts/DocsLayout.astro
title: Environment variables
description: Each site has one .env file, kept outside its releases. Edit it in the panel; Skiff applies the change to the running app.
---

## Where it lives

A site's variables are in `/home/skiff/<domain>/shared/.env`. Every release links to it, so it survives deploys and rollbacks. On the first deploy, Skiff creates it from the repository's `.env.example` if there is one.

## Editing

Open the site's **Env variables** page. It reads the file live from the server, so it always shows what's really there. When you save:

- The file is replaced atomically. A half-written `.env` is never visible to the app.
- Laravel: if the config is cached, `php artisan config:cache` runs again, and queue workers restart.
- Node.js and Python apps restart so they read the new values.
- Static sites: variables only matter at build time, so deploy again to use them.

## Variables Skiff writes for you

Skiff adds or updates some variables, and leaves the rest of the file alone:

| When | Variables |
|---|---|
| A database is created or attached (Laravel) | `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` |
| A database is created or attached (other apps) | `DATABASE_URL` |
| Redis is connected (Laravel) | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_PREFIX`, and optionally `CACHE_STORE`, `SESSION_DRIVER`, `QUEUE_CONNECTION` |
| Redis is connected (other apps) | `REDIS_URL` |
| HTTPS is enabled (Laravel) | `APP_URL` becomes `https://…`, if it was the default `http://<domain>` |
| An environment is created | `APP_ENV`, `APP_URL` and references to production's domain, in the copy |

## How apps receive them

- **Laravel** reads `.env` itself (or its cached config).
- **Node.js and Python apps**: Skiff's `env-exec` loads `.env` into the app's environment when its service starts, as the `skiff` user. `PORT`, `HOST=127.0.0.1` and, for Node, `NODE_ENV=production` are set too; a `PORT` in `.env` is overridden by Skiff's.
- **Commands** on the Commands page and the deploy script run in the same folder, so tools that read `.env` see it.

The format is the usual one: `KEY=value` lines, optional quotes, and `#` comments.

## Keeping secrets safe

- `.env` is readable by the `skiff` user, which all sites share. Keep apps you don't trust on separate servers. See [Security](/docs/security).
- Database passwords reach `.env` through an environment variable, never a command line, so they don't show up in job logs or process lists.
- Staging environments start with a copy of production's `.env`. Change the keys that must differ, such as payment or mail credentials, on the environment's own Env variables page.
