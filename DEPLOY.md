# STORMBLADE — Deployment Guide
**Picksaw Studio**

The game builds to a **single self-contained `dist/index.html`** (~486 KB) with all
JavaScript, CSS and assets inlined. No external files, no server, no build step at
runtime — which means it works from literally any static host, any sub-folder, and
even straight off a USB stick.

---

## 1. GitHub Pages (automatic, recommended)

A GitHub Action is already included at `.github/workflows/deploy.yml`.

### One-time setup
1. Create a repo on GitHub and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "STORMBLADE"
   git branch -M main
    git remote add origin https://github.com/Picksaw/StormBlade.git
    git push -u origin main
    ```
2. On GitHub: **Settings → Pages → Build and deployment**
   Set **Source** to **GitHub Actions** (not "Deploy from a branch").
3. Done. Every push to `main` rebuilds and redeploys automatically.

Your game will be live at:
```
https://Picksaw.github.io/StormBlade/
```

### Updating
Just push. The Actions tab shows the build; it takes about a minute.
You can also trigger a rebuild manually from **Actions → Build & Deploy → Run workflow**.

### Custom domain
Settings → Pages → Custom domain. Add a `CNAME` file to the repo root containing
your domain, then point a CNAME DNS record at `YOUR-USERNAME.github.io`.

---

## 2. Manual upload (no Git)

```bash
npm install
npm run build
```
Then drag **only `dist/index.html`** onto any of these:

| Host | How |
|---|---|
| **Netlify Drop** | Drag the `dist` folder onto app.netlify.com/drop |
| **Cloudflare Pages** | Create project → Direct Upload → drag `dist` |
| **WampServer / XAMPP** | Copy `index.html` into `www/stormblade/` |
| **Any web host** | FTP `index.html` into the public folder |

---

## 3. Telegram Mini App

1. Host the game anywhere with **HTTPS** (GitHub Pages works).
2. Talk to **@BotFather** → `/newbot`, then `/newapp`.
3. Paste your HTTPS URL.
4. Share `https://t.me/YourBot/YourGame`.

---

## 4. Native apps (Android APK / Windows EXE)

Both are wired up and buildable — see **[BUILD_APPS.md](BUILD_APPS.md)** for the
full guide.

**Quickest route (no local toolchain needed):** GitHub → Actions →
*Build APK & EXE* → Run workflow. Download the `.apk` and `.exe` from the run's
Artifacts. Pushing a `v*` tag also publishes them to a Release.

**Locally:**
```bash
npm run android:apk   # needs JDK 21 + Android SDK
npm run win:exe       # needs Node; produces installer + portable exe in release/
```

**No-build alternatives:** open the site in Chrome on Android → ⋮ → *Install app*,
or paste the URL into [PWABuilder.com](https://www.pwabuilder.com/) → Android.

---

## 5. Online leaderboard & accounts

The worker is already deployed at the URL baked into `src/game/meta.ts`.
If you ever move it, update `LEADERBOARD_API` there **and** in the two reset scripts.

### Resetting the boards for a new season
```bat
reset-leaderboard.bat            :: all modes
reset-leaderboard.bat battle     :: one mode
reset-leaderboard.bat all wipe   :: also delete accounts
```
`reset-leaderboard.sh` is the macOS/Linux equivalent.

Requires an `ADMIN_KEY` variable set on the Cloudflare Worker
(Settings → Variables and Secrets) matching the value in the script.

To also clear each player's **local** cached board, bump `SEASON` in
`src/game/core.ts` (e.g. `v4` → `v5`) and rebuild.

---

## Troubleshooting

**Board shows "OFFLINE"** — `LEADERBOARD_API` is empty in `src/game/meta.ts`.

**Phone and PC show different boards** — the build predates the online switch;
rebuild and redeploy.

**Blank page on GitHub Pages** — make sure Pages Source is set to *GitHub Actions*.
The single-file build has no path dependencies, so a blank page almost always
means the workflow didn't publish.

**Changes not appearing** — hard-refresh (Ctrl+F5). The service worker caches
aggressively for offline play.
