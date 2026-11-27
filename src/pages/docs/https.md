---
layout: ../../layouts/DocsLayout.astro
title: Domains and HTTPS
description: Point a domain at your server and get a free Let's Encrypt certificate for each site in one click.
---

## Pointing a domain at the server

At your DNS provider, create an **A record** for the domain (and an **AAAA record** if the server has IPv6) with the server's IP address. For `www`, add a record for `www.example.com` too and create it as its own site, or redirect it at your DNS provider.

DNS changes can take a few minutes to an hour to spread. Check with:

```bash
dig +short example.com
```

## Enabling HTTPS

In the site's **Settings → Domain & HTTPS**, press **Enable HTTPS**. Skiff:

1. Checks that the domain resolves, and warns if it points somewhere else.
2. Installs certbot and its Nginx plugin the first time (kept out of provisioning so small servers don't pay for it until needed).
3. Runs certbot, which adds the certificate and an HTTP-to-HTTPS redirect to the site's Nginx config, keeping any edits you made.
4. For Laravel, switches `APP_URL` to `https://` if it was the default `http://<domain>`, and refreshes the config cache.

The site's settings show the certificate's expiry date. Certbot's systemd timer renews it automatically, about 30 days before it expires.

### Requirements

- A real domain: not an IP address, `localhost` or a `.test` domain.
- Its A record points at this server.
- Port 80 is open to the internet, since Let's Encrypt checks over HTTP.
- The site has been deployed once.

## Removing HTTPS

**Remove HTTPS** deletes the certificate and resets the site's Nginx config to Skiff's plain-HTTP template. Deleting a site also deletes its certificate.

## Behind Cloudflare

With Cloudflare's proxy (orange cloud) on, set SSL/TLS to **Full (strict)** once the site has its certificate. To issue the first certificate, either turn the proxy off for a moment or make sure Cloudflare doesn't force HTTPS before the server has one.

## Laravel behind HTTPS

If Laravel builds `http://` links behind the HTTPS redirect, trust the proxy headers or force the scheme, for example in `AppServiceProvider::boot()`:

```php
if (app()->environment('production')) {
    \Illuminate\Support\Facades\URL::forceScheme('https');
}
```

## The panel's own HTTPS

The panel can have a domain and certificate of its own. See [The panel's address](/docs/panel).
