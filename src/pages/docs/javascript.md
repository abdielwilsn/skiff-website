---
layout: ../../layouts/DocsLayout.astro
title: JavaScript apps and static sites
description: Run Next.js, Nuxt, SvelteKit, Remix, Astro and any Node server under systemd, or serve a static build straight from Nginx.
---

## Two kinds of JavaScript site

| Type | Frameworks | How it's served |
|---|---|---|
| **Node.js app** | Next.js, Nuxt, SvelteKit (adapter-node), Remix / React Router, Astro (server output), Express, Fastify, NestJS, any Node server | Your start command runs as a systemd service; Nginx proxies the domain to it, WebSockets included. |
| **Static site** | Vite (React, Vue, Svelte, Solid), Astro, Create React App, Next.js static export, plain HTML | Nginx serves the build's output folder from the live release, falling back to `index.html` for client-side routes. |

Pick the framework on **New site**; it fills in the type, start command and output folder. All of them are editable later on the site's Overview.

## Node.js versions

Each site picks a Node.js LTS version: **22, 24 or 26** (default 24). It's installed the first time a site needs it, from the official nodejs.org builds (checksum-verified, into `/opt/skiff/node/<major>`), with no apt repositories or install scripts. `node`, `npm` and `npx` are that version during deploys and commands.

## Package managers

The default [deploy script](/docs/deploy-script) uses the package manager whose lockfile is in the repository:

- `pnpm-lock.yaml`: pnpm, through `npx`
- `yarn.lock`: Yarn, through `npx`
- `package-lock.json`: `npm ci`
- none: `npm install`

Then it runs the `build` script, if `package.json` has one.

## Node.js apps

The **start command** must start a server that listens on the port in `$PORT`. Defaults by framework:

| Framework | Start command |
|---|---|
| Next.js | `npm run start` (`next start` reads `PORT`) |
| Nuxt | `node .output/server/index.mjs` |
| SvelteKit | `node build` |
| Remix / React Router | `npm run start` |
| Astro (server) | `node ./dist/server/entry.mjs` |
| Express, Fastify, others | `npm run start` |

The app runs as a systemd service, `skiff-<domain>-app`, as the `skiff` user in the live release, with:

- `PORT`, a free port Skiff assigns, and `HOST=127.0.0.1`;
- `NODE_ENV=production`;
- the variables in the site's `.env`.

It restarts if it crashes, and on every deploy, rollback and `.env` save. **Restart** on the Overview restarts it by hand.

After switching to a new release, Skiff waits for the app to answer on its port. If it doesn't start, **the previous release is put back automatically**, and the deploy is marked failed with the app's last log lines.

> Make sure your server binds to `127.0.0.1` or `0.0.0.0` and reads `PORT`. Many frameworks do this by default; for Express, use `app.listen(process.env.PORT)`.

## Static sites

Set the **output folder** to where the build writes: `dist` for Vite and Astro, `build` for Create React App, `out` for a Next.js static export, or `.` for plain HTML with no build. Nginx serves it from the live release with:

- long-lived caching for hashed assets;
- a fallback to `index.html`, so client-side routes work on reload;
- no Node.js process at runtime.

Variables in `.env` are only used at build time. Change them, then deploy again.

## Environment variables at build time

Frameworks like Vite and Next.js inline public variables (`VITE_*`, `NEXT_PUBLIC_*`) during the build. Put them in the site's `.env`, and load it at the top of the deploy script so the build sees them:

```bash
set -a; [ -f .env ] && . ./.env; set +a
```
