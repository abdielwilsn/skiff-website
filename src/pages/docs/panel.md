---
layout: ../../layouts/DocsLayout.astro
title: The panel's address
description: Serve the panel at its own domain with a trusted certificate, reach it through an SSH tunnel, or put it behind your own proxy.
---

## Out of the box

The panel listens on port **8090** and speaks HTTPS from the first start, with a self-signed certificate. Your browser warns about it once; check the fingerprint against `sudo skiff tls-fingerprint`.

Plain HTTP on that port is only answered for requests from the server itself, such as SSH tunnels and Skiff's own proxy. Anything else is redirected to HTTPS.

## Giving the panel a domain

In **Settings → Panel address & HTTPS**, enter a domain such as `panel.example.com` that points at the server. Skiff:

1. Writes an Nginx reverse proxy from that domain to the panel on `127.0.0.1:8090`.
2. Gets a Let's Encrypt certificate for it with certbot, the same way sites do. If that fails, the proxy is removed again, so nothing is left half-configured.
3. From then on, redirects visits to `IP:8090` to `https://panel.example.com`.

Afterwards:

- Update your GitHub OAuth app's callback URL to `https://panel.example.com/github/callback`.
- You can close port 8090 in your firewall.
- Push-to-deploy webhooks need this domain, since GitHub only delivers to a trusted HTTPS address.

The proxy passes a secret header so the panel knows a request really came through it. That's what lets it trust the client IP for login rate limiting. The proxy config is readable by root only.

## SSH tunnel

Requests from the server itself are never redirected, so an SSH tunnel always works, with or without a domain:

```bash
ssh -L 8090:localhost:8090 root@your-server
# then open http://localhost:8090
```

## If the domain stops working

If the panel's domain stops resolving or its certificate expires, run on the server:

```bash
sudo skiff reset-panel-domain
```

The panel answers on `https://IP:8090` again within seconds. Set the domain up again from Settings once it's fixed.

## Your own reverse proxy

To put the panel behind a proxy you run yourself, such as Caddy or a load balancer, start Skiff with its public URL so it builds links and callbacks correctly:

```bash
sudo systemctl edit skiff
# [Service]
# Environment=SKIFF_URL=https://panel.example.com
sudo systemctl restart skiff
```

Proxy to `http://127.0.0.1:8090` from the same machine. Requests from other machines must use HTTPS.

## A different port

Choose the port when installing, with `--port`:

```bash
curl -fsSL https://raw.githubusercontent.com/abdielwilsn/skiff/main/scripts/install.sh | sudo bash -s -- --port 9000
```
