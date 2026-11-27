---
layout: ../../layouts/DocsLayout.astro
title: Staging and environments
description: Give a site a staging, preview or dev environment on its own branch, domain, .env and database, then promote the exact commit it runs to production.
---

## What an environment is

An environment is a full copy of a site's setup: the same repository, project type, runtime versions, deploy script, workers and scheduler. It's deployed from **its own branch** to **its own domain**, and it has its own releases, `.env`, logs, Commands page, HTTPS certificate and push-to-deploy webhook.

Production is the site you created first. Switch between a site's environments from the menu at the top of its sidebar.

## Adding one

On the site's **Environments** page, choose:

- **Name**: `staging`, `preview`, `dev` or your own.
- **Branch**: for example `develop` or `staging`.
- **Domain**: for example `staging.example.com`, pointing at the same server.
- **Copy production's variables**: on by default. Untick it to start from `.env.example` instead.

The environment deploys right away.

## Variables

The copied `.env` is adjusted for the new environment:

- `APP_ENV` becomes the environment's name, and `APP_URL` its address.
- URLs, allowed hosts and cookie domains that name production's domain (`SESSION_DOMAIN`, `ALLOWED_HOSTS`, `NEXT_PUBLIC_SITE_URL` and the like) get the new domain.
- Database settings point at the environment's own database (below).
- Everything else, including mail, payment and API keys, is copied as it is. **Swap live credentials for test ones** on the environment's Env variables page.

## Databases

- A site whose MySQL or PostgreSQL database Skiff manages gets a **separate database** for each environment, of the same engine. Staging's migrations and test data never touch production's.
- A site using Redis shares the server's Redis, with a key prefix of the environment's own, so cache and queue keys never mix.
- SQLite files live in each environment's own folder anyway.
- If production's `.env` points at a database server Skiff doesn't manage, the copy points there too. Change it on the environment's Env variables page.

To give staging realistic data, [import](/docs/importing) a production backup into its database.

## Promote to production

On an environment, **Promote to production** deploys the **exact commit** that environment runs to production, through production's normal deploy: backup first, deploy script, migrations, health check, and rollback if it fails.

Production keeps following its own branch. Merge the change there too, or production's next deploy (or push) builds that branch's tip again.

## Deleting an environment

Delete it from its own **Settings** page, like any site. Its database is kept and detached, like any deleted site's. A production site can't be deleted while it still has environments.
