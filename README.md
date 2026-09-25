# Πυθία · Pithia

A premium editorial site for **Πυθία**, the Greek house of rolling craft since 2013.

Built with **SvelteKit** and deployed as a fully static site to **GitHub Pages**.

## Stack

| Layer | What |
|---|---|
| Framework | [SvelteKit](https://kit.svelte.dev/) + Svelte 5 |
| Build | Vite |
| Deploy | `@sveltejs/adapter-static` → GitHub Pages |
| 3D | Three.js (hero orbital overlay) |
| Copy | `src/lib/i18n.js` (Greek default, English) |

## Development

```bash
npm install
npm run dev
```

Open <http://localhost:5173/>.

## Build

```bash
npm run build
npm run preview
```

The static output lands in `build/`.

## Deploy to GitHub Pages

The site is a static SvelteKit build. `.github/workflows/pages.yml` already builds `build/` and publishes it. Do not add a second workflow.

### 1. Put the repo on GitHub

The default branch must be `main`. The workflow runs on every push to `main`, and you can also start it by hand from the Actions tab.

### 2. Turn on Pages

In the repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

Save that. The first successful run creates the `github-pages` environment.

### 3. Set the base path

Asset and page links use `BASE_PATH`.

| Site address | Variable `BASE_PATH` |
|---|---|
| `https://USERNAME.github.io/REPO/` | `/REPO` |
| `https://USERNAME.github.io/` (the repo is named `USERNAME.github.io`) | leave empty |
| A custom domain at the root, such as `https://pithia.gr/` | leave empty |

Add it under **Settings → Secrets and variables → Actions → Variables** (not Secrets). Name: `BASE_PATH`. Value example: `/site`.

If this is wrong, the HTML loads and CSS, images, and client navigation 404.

### 4. What the workflow does

`.github/workflows/pages.yml`:

1. Checks out the repo.
2. Installs Node 22 and runs `npm ci` from `package-lock.json`.
3. Runs `npm run build` with `BASE_PATH`. That regenerates product and supplier JSON, then writes the static site into `build/`.
4. Uploads `build/` with `actions/upload-pages-artifact`.
5. Publishes it with `actions/deploy-pages`.

Permissions on the workflow are `contents: read`, `pages: write`, and `id-token: write`. Those are required. Do not switch the job to `pull_request` deploys; Pages deploy tokens are for the default branch.

### 5. Confirm it worked

Open the **Actions** tab, wait for **Deploy to GitHub Pages** to finish, then open the URL printed on the deploy job. It is also listed under **Settings → Pages**.

### Custom domain

**Settings → Pages → Custom domain.** Add the domain GitHub shows you need in DNS (`A` / `AAAA` records, or a `CNAME` for a subdomain). Keep **Enforce HTTPS** on after the certificate is issued.

If the domain serves the site at `/`, `BASE_PATH` stays empty. Add a `static/CNAME` file containing only the domain name, for example `pithia.gr`, so later deploys do not drop the custom domain.

### Contact form

Formspree is separate from Pages. In the Formspree form settings, allow the live site origin (the `github.io` URL or the custom domain). Otherwise the form on the contact page is blocked after deploy.

## Project structure

```
.
├── src/
│   ├── app.css              ← global styles
│   ├── app.html             ← HTML shell
│   ├── lib/
│   │   ├── i18n.js          ← Greek + English copy
│   │   ├── three-hero.js    ← Three.js scene
│   │   └── components/      ← AgeGate, Header, Hero, sections…
│   └── routes/
│       ├── +layout.svelte
│       └── +page.svelte     ← app shell
├── static/
│   └── assets/              ← logo, silhouette, images
├── .github/workflows/
│   └── pages.yml            ← GitHub Pages deploy
└── svelte.config.js
```

## License

Brand assets (`pithia-logo.png`, `pithia-silhouette.png`, etc.) © Πυθία. Code is project-internal.
