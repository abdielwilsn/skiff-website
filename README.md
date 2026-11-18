# Skiff website

The marketing site for Skiff, built with [Astro](https://astro.build) as a
fully static page (no server, a few lines of JavaScript for the copy button).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static files in dist/
```

## Deploy on Vercel (free Hobby plan)

1. In Vercel, **Add New → Project** and import the `abdielwilsn/skiff-website`
   repository.
2. Vercel detects Astro and fills in the build settings (`npm run build`,
   output `dist`). Nothing to change.
3. Deploy. Every push to `main` redeploys the site, and pull requests get
   preview URLs.

Skiff itself lives at [abdielwilsn/skiff](https://github.com/abdielwilsn/skiff).

`vercel.json` adds a redirect so the site can serve as a short install URL:

```bash
curl -fsSL https://<your-site>/install.sh | sudo bash
```

Edit content in `src/pages/index.astro`; styles live in `src/styles/global.css`.
