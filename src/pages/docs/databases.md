---
layout: ../../layouts/DocsLayout.astro
title: Databases and Redis
description: Install MySQL, PostgreSQL and Redis when you need them, give each site its own database and user, and have the connection written into .env for you.
---

## Installing a database server

None of them are part of provisioning. On the **Databases** page, install each one the first time you need it. All of them listen on `127.0.0.1` only, so they can't be reached from the internet.

| Service | Details |
|---|---|
| **MySQL 8** | From Ubuntu's packages. Skiff administers it as root over the Unix socket, so no root password exists. On servers with less than 2 GB of RAM, a config file trims it to fit (no performance schema, a 64–128 MB buffer pool, 50 connections). |
| **PostgreSQL** | From Ubuntu's packages (16 on Ubuntu 24.04). Administered as the `postgres` system user. On small servers, `shared_buffers` and `max_connections` are lowered. |
| **Redis** | From Ubuntu's packages, with a password Skiff generates (shown on the Databases page). |

PHP's `mysql` and `pgsql` extensions come with every PHP version.

## A database for a site

**New site → Database** creates a MySQL or PostgreSQL database and a user of the same name with a random password, and writes the connection into `.env` on the first deploy, before migrations run:

- **Laravel**: `DB_CONNECTION` (`mysql` or `pgsql`), `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
- **Everything else**: `DATABASE_URL`, such as `postgres://user:password@127.0.0.1:5432/name` or `mysql://user:password@127.0.0.1:3306/name`, which dj-database-url, Prisma, Drizzle, SQLAlchemy and most libraries read. Your app still needs its driver, such as `psycopg` or `pg`.

### Standalone databases

On the **Databases** page you can also:

- create a database that isn't attached to any site;
- **attach** one to a deployed site: its `.env` is updated, Laravel migrations run, and other apps restart;
- **detach** one (the site's `.env` isn't changed);
- reveal a database's password;
- **import** a dump into it (see [Importing a database](/docs/importing));
- delete a database, after typing its name.

Each user can only reach its own database. PostgreSQL databases are owned by their own role, and other roles can't even connect.

## SQLite

Laravel's `database/database.sqlite` and Django's `db.sqlite3` live in the site's `shared/` folder, so they survive deploys. They're backed up and can be restored and imported like the others.

## Redis

Connect Redis when creating a site, or with **Use Redis** on its Overview:

- **Laravel** gets `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` and a `REDIS_PREFIX` of its own, such as `app_example_com_`, so sites and their staging environments never see each other's keys. Optionally (on by default) `CACHE_STORE`, `SESSION_DRIVER` and `QUEUE_CONNECTION` switch to `redis`. Skiff installs the `phpredis` extension.
- **Other apps** get `REDIS_URL=redis://default:password@127.0.0.1:6379/0`.

The site's app or workers restart to pick it up. Redis isn't backed up: it holds caches, sessions and queued jobs, which are meant to be short-lived.

## Connecting from your computer

Databases only listen on localhost. Use an SSH tunnel, then connect your client (TablePlus, DBeaver, pgAdmin…) to `127.0.0.1` on the local port, with the database's user and password from the Databases page:

```bash
ssh -N -L 3307:127.0.0.1:3306 root@your-server   # MySQL
ssh -N -L 5433:127.0.0.1:5432 root@your-server   # PostgreSQL
```

Most clients can also open the SSH tunnel themselves ("Connect over SSH").

## On the server

As root, without passwords:

```bash
mysql                                     # MySQL, as root over the socket
sudo -u postgres psql                     # PostgreSQL superuser
sudo -u postgres psql -d app_example_com
```

Passwords are stored in Skiff's root-only database so the panel can show them, and reach the database over stdin, so they never appear in job logs or process lists.
