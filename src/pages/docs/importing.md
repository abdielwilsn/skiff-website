---
layout: ../../layouts/DocsLayout.astro
title: Importing a database
description: Load a dump from another server into one of Skiff's databases, by uploading it in the browser or copying it to the server.
---

> Database import is new in Skiff v0.4.3. [Update](/docs/updating) if your panel doesn't have **Backups → Import** yet.

## Before you import

Imports go into a database Skiff already manages, and **replace everything in it**. So first:

1. Create the site (with **Database** ticked) or a standalone database on the **Databases** page. For SQLite, deploy the site once.
2. Get a dump of the old database (see [Making a dump](#making-a-dump)).

Skiff takes a safety backup of the target database before importing, so you can undo an import from the **Backups** page.

## Supported files

| Database | Accepted |
|---|---|
| MySQL | `.sql` from mysqldump, MariaDB's dump tool, phpMyAdmin, TablePlus, Adminer and the like |
| PostgreSQL | `.sql` from pg_dump, or a pg_dump archive (`pg_dump -Fc` or `-Ft`) |
| SQLite | the database file itself (`.sqlite`, `.db`) |

Any of these can be gzipped (`.gz`), or inside a `.zip` that holds exactly one database file, such as a [spatie/laravel-backup](https://github.com/spatie/laravel-backup) archive. Skiff looks at the file's contents rather than its name, and refuses a file that doesn't match the database, such as a PostgreSQL dump going into MySQL, before changing anything.

## Option 1: upload in the browser

1. Open **Backups → Import**, or **Import…** next to a database on the Databases page.
2. Choose the database to import into.
3. Choose **Upload from this computer** and pick the file.
4. Tick the confirmation box and press **Import**.

The file uploads in 3 MB pieces with a progress bar, so large dumps work, even through the panel's own domain. Then the import runs as a job, with a live log. Uploaded files are deleted from the server afterwards.

## Option 2: copy the file to the server

Best for very large dumps, or when the file is already on another server:

```bash
scp backup.sql.gz root@your-server:/var/backups/skiff/imports/
```

Or pull it straight from the old server, from your new server:

```bash
scp root@old-server:/path/to/backup.sql.gz /var/backups/skiff/imports/
```

Reload the import page, choose **A file already on the server**, and pick it. Files you copied there are kept after the import; delete them when you're done. Only root can write to that folder.

## What happens during an import

1. **Check**: Skiff detects the format, unzips or converts it (pg_dump archives become SQL with `pg_restore --no-owner --no-privileges`), and checks it matches the database.
2. **Keep**: the converted file is stored as an **Imported** backup of the database, so you can restore it again later.
3. **Safety backup** of the current data.
4. **Replace**: the database is dropped and recreated, then the dump is loaded.
5. **Restart** the site's app or workers.

### Dumps from other servers just work

Dumps carry details of the server they came from. Skiff adjusts these so they load into the new database:

- **MySQL**: `CREATE DATABASE` and `USE` statements are skipped, so the dump goes into the database you chose whatever it was called before. `DEFINER=` clauses on views, triggers and procedures are dropped, so they're owned by the new user. GTID and binary-log statements, which need server-wide privileges, are skipped, as is MariaDB's "sandbox mode" line.
- **PostgreSQL**: `OWNER TO`, `GRANT` and `REVOKE` for roles that don't exist here are skipped; tables end up owned by the database's own user. `CREATE DATABASE` and `\connect` lines are skipped. Extensions the dump uses (`pg_trgm`, `uuid-ossp`, `citext`…) are created first by the superuser.

Data rows are never changed.

### Imports can't reach anything else

A dump is code that runs against your database, so Skiff treats it as untrusted. It's loaded by an unprivileged system user, connected as **the target database's own user**, which can't touch other databases. MySQL runs in `--binary-mode`, which refuses client commands like `\!`. A dump that tries to drop another site's database simply fails.

## If an import fails

The job log shows the error, such as a syntax error or an extension the server doesn't have. The database may be partly imported. Restore the safety backup from the **Backups** page to undo it, fix the dump, and import again.

Common causes:

- **A dump from a newer PostgreSQL** than the server's (for example from 17 into 16). Make the dump with the new server's `pg_dump` version, or as plain SQL.
- **MySQL features the new server lacks**, such as a collation from a newer MySQL or MariaDB. Replace the collation in the dump (for example `utf8mb4_0900_ai_ci` to `utf8mb4_unicode_ci`).
- **A zip with several databases**: unzip it and import the one you want.

## Making a dump

On the old server:

```bash
# MySQL or MariaDB
mysqldump --single-transaction --routines --triggers my_db | gzip > my_db.sql.gz

# PostgreSQL
pg_dump -Fc my_db > my_db.dump

# SQLite (safe while the app runs)
sqlite3 database.sqlite ".backup backup.sqlite"
```

From a managed host, use its export or backup download: Forge, Ploi and RunCloud backups, phpMyAdmin's Export, and Heroku's `pg:backups:download` all produce files Skiff accepts.
