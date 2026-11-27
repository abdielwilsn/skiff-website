---
layout: ../../layouts/DocsLayout.astro
title: Backups and restores
description: Every database is backed up nightly and before each deploy, optionally copied to S3-compatible storage, and restorable in one click.
---

## What's backed up

Every database on the server:

- **MySQL** with `mysqldump --single-transaction`: a consistent snapshot, without locking the app.
- **PostgreSQL** with `pg_dump`: plain SQL without ownership, so it restores into any database.
- **SQLite** databases of deployed sites, with SQLite's `.backup`, which is safe while the app writes.

Redis isn't backed up. Neither are uploaded files in `storage/`; see [Files](#files).

## When

- **Nightly**, at 03:00 server time by default. Change the time, or turn it off, under **Backups → Schedule**.
- **Before every deploy** of a Laravel or Python site, so a bad migration can be undone. If this backup fails, the deploy stops and nothing changes. Turn off **Back up before each deploy** to deploy anyway.
- **Before every restore or import**: a safety backup of the data being replaced.
- **On demand**: **Back up now** for every database, or **Back up** for one.

## Where they're kept

Files are gzipped into `/var/backups/skiff/<database>/`, readable by root only. Skiff keeps the newest **7** nightly and manual backups per database (configurable up to 90), plus the newest **3** taken before deploys, restores and imports.

### Off-site storage

A backup on the same server is lost if the server is. Under **Backups → Off-site storage**, add any S3-compatible bucket:

| Provider | Endpoint example |
|---|---|
| AWS S3 | `https://s3.us-east-1.amazonaws.com` |
| Cloudflare R2 | `https://<account id>.r2.cloudflarestorage.com` |
| Backblaze B2 | `https://s3.us-west-004.backblazeb2.com` |
| DigitalOcean Spaces | `https://ams3.digitaloceanspaces.com` |
| Hetzner Object Storage | `https://fsn1.your-objectstorage.com` |
| MinIO | your MinIO URL |

Every backup is then also uploaded to `<folder>/<server>/<database>/` in the bucket. Old backups are deleted from the bucket along with the local copies. Saving the settings tests the connection first.

Use a key that can only reach that bucket. The keys are stored in Skiff's root-only database and passed to curl on stdin, so they never appear in logs or process lists. Consider turning on versioning or object lock on the bucket, so a compromised server can't delete its own off-site history.

## Restoring

On the **Backups** page, **Restore** next to a backup:

1. Takes a **safety backup** of the database's current data.
2. Downloads the file from the bucket if the local copy is gone.
3. Replaces the database. MySQL and PostgreSQL databases are dropped and recreated, then the dump is loaded as the database's own user. SQLite files are swapped atomically.
4. Restarts the site's app or queue workers, so nothing keeps stale connections or caches.

Everything written to the database since the backup is replaced. If you restored the wrong one, restore the safety backup it took.

## Downloading

**Download** saves any backup to your computer as a `.sql.gz` (MySQL, PostgreSQL) or `.sqlite.gz` file. Open one with:

```bash
gunzip -c backup.sql.gz | mysql my_local_db          # MySQL
gunzip -c backup.sql.gz | psql my_local_db           # PostgreSQL
gunzip -c backup.sqlite.gz > database.sqlite         # SQLite
```

## Files

Skiff backs up databases, not files. If your app stores uploads on the server (`storage/app` in Laravel), either keep them in object storage (S3, R2…) through your framework's filesystem settings, which is the better option, or back up `/home/skiff/<domain>/shared` yourself.
