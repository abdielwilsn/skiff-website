---
layout: ../../layouts/DocsLayout.astro
title: How deploys work
description: Every deploy builds a new release next to the live one and switches over only when everything succeeded, so a failed deploy never takes the site down.
---

## Starting a deploy

A deploy starts when you:

- press **Deploy** on a site,
- push to the site's branch, with push-to-deploy on,
- promote an environment's commit to production,
- or create the site (its first deploy).

Jobs run one at a time on the server, in order. Each one has a live log on its job page, and its history is kept on the site's **Deployments** page.

## What happens during a deploy

1. **Back up**: for Laravel and Python sites with a database, Skiff takes a backup first, so a bad migration can be undone. If the backup fails, the deploy stops and nothing changes. You can turn this off on the Backups page.
2. **Fetch**: the newest commit of the branch is fetched into a git cache that only root can read, then unpacked into a new folder, `releases/<timestamp>/`, owned by the `skiff` user. The GitHub token is only ever in git's environment, so nothing running as your site can read it.
3. **Link shared files**: `.env`, Laravel's `storage/` and the SQLite database are linked into the release from `shared/`, so they survive deploys. On the first deploy, `.env` is created from `.env.example`.
4. **Build**: the site's [deploy script](/docs/deploy-script) runs in the release as the `skiff` user: installing dependencies, building assets, running migrations.
5. **Switch**: only if every step succeeded, `current` is pointed at the new release with an atomic rename. Nginx and PHP-FPM reload, and app processes, queue workers and the scheduler restart on the new code.
6. **Check**: Node and Python apps must answer on their port after the switch. If one doesn't start, the previous release is put back automatically and the deploy is marked failed, with the app's last log lines.
7. **Clean up**: the five newest releases are kept. Older ones are deleted, and `node_modules` is dropped from releases that aren't live.

If any step fails before the switch, the unfinished release is deleted and the live site keeps running unchanged.

## Push to deploy

In a site's **Settings → Git**, **Turn on** adds a webhook to the GitHub repository. From then on, every push to the site's branch queues a deploy, and the job's title shows the commit and who pushed it.

- GitHub delivers to `https://<panel domain>/hooks/github/<site id>`, so the panel needs [its own HTTPS domain](/docs/panel) first.
- Each site has its own webhook secret. Deliveries without a valid signature are rejected, and pushes to other branches are ignored.
- Pushes that arrive while a deploy is already queued are folded into it, since every deploy fetches the latest commit anyway.
- Your GitHub account needs admin access to the repository to add the webhook.
- **Turn off**, or deleting the site, removes the webhook from GitHub.

## Rolling back

The site's **Deployments** page lists the kept releases. **Roll back** switches `current` to an older release instantly. Skiff rebuilds Laravel's config cache from the current `.env` and restarts the site's processes.

Database migrations that ran since that release are **not** undone. To go back fully, also [restore the backup](/docs/backups#restoring) taken before the deploy you're undoing.

## Zero-downtime details

- The switch is a single atomic rename, so requests are served by either the old release or the new one, never a half-copied mix.
- PHP-FPM is reloaded rather than restarted, so in-flight requests finish.
- Node and Python apps restart on the new release. Requests that arrive during the restart (usually a second or two) can fail. If that matters, put your app behind a process manager that supports zero-downtime reloads in its start command.
