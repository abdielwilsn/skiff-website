---
layout: ../../layouts/DocsLayout.astro
title: Security
description: How Skiff protects the panel, your credentials and your sites, and the limits you should know about.
---

## The model in one paragraph

The panel runs as **root**, because it installs packages and writes Nginx and systemd config. Everything that runs **your code** (deploy scripts, apps, workers, the scheduler, commands) runs as the unprivileged **`skiff`** user. Skiff is built so that code running as `skiff` can't reach root's secrets or trick root into reading or writing files for it.

## Signing in

- **First-run setup** needs a token that's only readable on the server, printed by the installer.
- **HTTPS from the start**: the panel's port uses a self-signed certificate until it has [a domain](/docs/panel), so your password never crosses the network in the clear. Check the fingerprint with `sudo skiff tls-fingerprint`.
- **Rate limiting**: logins, including the two-factor step, are limited per IP. Behind the panel's own proxy, the real client IP is trusted only when the request carries the proxy's secret header, so a site on the server can't fake its IP to get around the limit.
- **Sessions** are HttpOnly, SameSite cookies, marked Secure over HTTPS. They end after 12 hours without use and 30 days after login. Every form carries a CSRF token.

### Two-factor login

In **Settings → Login security**, turn on two-factor login:

1. Scan the QR code with an authenticator app (1Password, Bitwarden, Google Authenticator, Authy…), or type the key.
2. Enter the 6-digit code to confirm.
3. Save the **10 recovery codes** somewhere safe. Each works once, in place of a code.

Turning it on logs out every other session. **Log out other sessions** in the same card does that at any time.

Lost your phone and the recovery codes? On the server:

```bash
sudo skiff disable-2fa
```

## Credentials

| Secret | Where it lives | Who can read it |
|---|---|---|
| GitHub token, OAuth secret, S3 keys | `/var/lib/skiff/skiff.db` | root |
| Database and Redis passwords | Skiff's database, and each site's `.env` | root; the `skiff` user for `.env` |
| Backups | `/var/backups/skiff` | root |
| The panel's TLS key | `/var/lib/skiff/panel-tls.key` | root |

- **The GitHub token never reaches your sites.** Git runs as root, with the token in its environment only, in a cache root alone can read. Releases are unpacked by `skiff` from that cache.
- Passwords and keys are passed over stdin or the environment, never on a command line, so they don't appear in process lists or job logs.

## Isolation between root and sites

- **`.env` files** are loaded into apps by `skiff env-exec` running as the site user, not by systemd as root, so a `.env` linked to a root-only file just fails to open.
- **Site files** (SQLite databases, `laravel.log`) are read and written as `skiff` during backups, restores and on the Logs page. A symlink planted by a site can't make root read or overwrite anything else.
- **Database imports and restores** are loaded by an unprivileged user connected as the target database's own user, so a dump can't reach other databases or run commands as root.

## Limits to know about

- **All sites share the `skiff` user**, so one site can read another site's files and `.env`. Don't host apps you don't trust next to ones that matter. Use separate servers.
- **Redis is shared**. Sites use separate key prefixes, but a site with the Redis password can read any key.
- **The panel admin is powerful.** Anyone who can log in can deploy code, read `.env` files and restore databases. Use a strong password and two-factor login.
- Skiff doesn't manage the server's firewall. Open only 22, 80, 443, and 8090 until the panel has a domain. Consider `ufw`:

```bash
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw allow 8090/tcp && ufw enable
```

## Hardening checklist

- [ ] Panel on its own domain with HTTPS
- [ ] Two-factor login on, recovery codes saved
- [ ] Off-site backups to a bucket with versioning
- [ ] SSH with keys only (`PasswordAuthentication no`)
- [ ] Firewall allowing only the ports you use
- [ ] Untrusted apps on separate servers

## Reporting a vulnerability

Please report security issues privately through [GitHub's security advisories](https://github.com/abdielwilsn/skiff/security/advisories/new) rather than in a public issue.
