---
layout: ../../layouts/DocsLayout.astro
title: Introduction
description: Skiff is a small, self-hosted panel that turns an Ubuntu server into a push-to-deploy host for Laravel, JavaScript and Python apps.
---

Skiff runs on your own server. Connect a GitHub repository, pick a domain, and Skiff provisions the runtimes, builds each release, serves it with Nginx and redeploys on every `git push`. There's no hosted control plane, so your code, data and credentials never leave the machine.

It's one Go binary of about 14 MB that idles around 16 MB of RAM, with a server-rendered web panel built in. Skiff keeps its own state in SQLite, so you don't run a database server for it.

## What Skiff handles

- **Provisioning**: Nginx, PHP, Composer, Node.js, Python (through uv), swap on small machines, and an unprivileged `skiff` user that every site runs as.
- **Deploys**: each one is built in its own release folder and goes live with an atomic switch. A failed build never touches the live site, and the last five releases stay one click away.
- **Processes**: Node and Python apps, Laravel queue workers and the scheduler run as supervised systemd services and restart on every deploy.
- **Databases**: MySQL, PostgreSQL and Redis, installed on demand. Each site gets its own database and user, wired into its `.env`.
- **Backups**: nightly and before every deploy, optionally copied to any S3-compatible bucket. Restores and imports are one click, with a safety backup taken first.
- **HTTPS**: free Let's Encrypt certificates for your sites and for the panel itself, renewed automatically.
- **Staging**: an environment with its own branch, domain, `.env` and database, plus a button that promotes the exact commit it runs to production.

## Supported stacks

| Stack | Examples | How it runs |
|---|---|---|
| Laravel | Laravel, Inertia, Livewire, Filament | PHP-FPM (8.2–8.5) behind Nginx |
| Node.js apps | Next.js, Nuxt, SvelteKit, Remix, Astro SSR, Express, Fastify, NestJS | A systemd service that Nginx proxies to |
| Static sites | Vite, React, Vue, Svelte, Astro, plain HTML | Files served by Nginx, with SPA fallback |
| Python apps | Django, FastAPI, Flask, any WSGI or ASGI app | gunicorn or uvicorn under systemd |

## How it fits together

```
                 ┌──────────────── your server ────────────────┐
 git push ──▶ GitHub webhook ──▶ Skiff panel (root, port 8090)  │
                 │                  │ builds releases as "skiff"│
 browser ──▶ Nginx :80/:443 ──▶ PHP-FPM / your app / static files
                 │                  │                           │
                 │        MySQL · PostgreSQL · Redis (localhost)│
                 └─────────────────────────────────────────────┘
```

The panel runs as root because it installs packages and writes Nginx config. Everything that runs your code (deploy scripts, apps, workers, commands) runs as the unprivileged `skiff` user. Databases listen on localhost only.

## Requirements

- A server running **Ubuntu 22.04 or 24.04**, x86-64 or ARM. 1 GB of RAM is enough for a small Laravel app; Skiff adds swap on machines with less than 2 GB.
- Root access over SSH.
- Ports 80 and 443 open for your sites, and 8090 for the panel until you give it a domain.
- A GitHub account. A domain is optional to start, but you need one for HTTPS.

## Where to go next

- [Install Skiff](/docs/installation) on a server.
- [Deploy your first site](/docs/first-deploy) in a few minutes.
- [Move from another server](/docs/moving-servers), databases included.
