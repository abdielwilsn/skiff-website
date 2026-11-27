---
layout: ../../layouts/DocsLayout.astro
title: Connecting GitHub
description: Skiff reaches your repositories through a GitHub OAuth app that you own, so no third party ever holds your token.
---

## Why you create your own OAuth app

Skiff has no central service. Each panel signs in to GitHub with an OAuth app registered on your own account, so the token it gets is only ever stored on your server.

The token is used to list your repositories, clone and fetch them during deploys, and add push-to-deploy webhooks.

## Register the app

1. In the panel, open **Settings → GitHub**. It shows the **Homepage URL** and **Authorization callback URL** to use, based on the panel's current address.
2. On GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App** (or [github.com/settings/applications/new](https://github.com/settings/applications/new)).
3. Fill in:
   - **Application name**: anything, for example "Skiff on my-server".
   - **Homepage URL**: from the panel.
   - **Authorization callback URL**: from the panel, ending in `/github/callback`.
4. Register it, then press **Generate a new client secret**.
5. Paste the **Client ID** and **Client secret** into the panel and save.
6. Press **Connect GitHub** and approve the app on GitHub.

> If you later give the panel a domain, update the callback URL in the OAuth app to `https://<panel domain>/github/callback`.

## What access Skiff gets

Skiff asks for the `repo` scope (to clone private repositories and manage their webhooks) and `read:user`. The token is stored in Skiff's root-only database. During deploys, git runs as root with the token in its environment only, never in a file or a remote URL, so code running as your sites can't read it. See [Security](/docs/security).

## Organization repositories

The **Repositories** page lists every repository you own, collaborate on, or can reach through an organization, newest push first.

If an organization's repositories are missing, the organization probably restricts OAuth apps. Its repositories stay hidden until an owner approves your app:

1. Open `https://github.com/settings/connections/applications/<your client ID>`. The Repositories page links to it.
2. Next to the organization, press **Grant** if you're an owner, or **Request** to ask one.
3. Back in Skiff, press **Refresh** on the Repositories page.

For push-to-deploy on an organization's repository, your GitHub account also needs admin access to that repository, since adding a webhook requires it.

## Disconnecting

**Settings → GitHub → Disconnect** forgets the token. To revoke it on GitHub's side too, open **Settings → Applications → Authorized OAuth Apps** on GitHub and revoke the app. If GitHub reports the token as revoked, Skiff forgets it and asks you to connect again.
