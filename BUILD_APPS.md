# STORMBLADE — Building the APK and the EXE
**Picksaw Studio**

The game now builds three ways from one codebase:

| Target | Output | Command |
|---|---|---|
| Web / GitHub Pages | `dist/index.html` | `npm run build` |
| Android | `.apk` | `npm run android:apk` |
| Windows | `.exe` (installer + portable) | `npm run win:exe` |

---

## How it works

`vite.config.ts` has two modes, switched by the `APP_TARGET` env var:

* **default** → `base: '/StormBlade/'`, output `dist/` — for GitHub Pages.
* **`APP_TARGET=app`** → `base: './'`, output `dist-app/` — relative paths, which is
  mandatory for packaged apps because they load from `file://` (Electron) or
  `https://localhost` (Capacitor), not from `/StormBlade/`.

`npm run build:app` is the shortcut for the packaged build. Both still produce a
single self-contained `index.html` thanks to `vite-plugin-singlefile`, so offline
play needs no server.

The service worker is now skipped inside Capacitor/Electron (it would only get in
the way — the assets are already local).

---

## Easiest path: let GitHub build them

You don't need Java, the Android SDK, or a Windows machine. A workflow at
`.github/workflows/build-apps.yml` builds **both** the APK and the EXE.

**Run it:**
* GitHub → **Actions** → **Build APK & EXE** → **Run workflow**, or
* push a version tag:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

**Get the files:** Actions → the run → **Artifacts**:
* `stormblade-android` → `STORMBLADE-debug.apk`, `STORMBLADE-release.apk`
* `stormblade-windows` → `STORMBLADE-1.0.0-win-x64.exe` (installer) and
  `STORMBLADE-1.0.0-portable.exe` (single-file, no install)

Tag pushes also attach everything to a GitHub Release automatically.

### Signing the release APK
Without secrets the workflow generates a throwaway key so the APK is installable
for testing — but **that key changes every run**, so users can't upgrade over a
previous install, and you can't ship it to Play.

For a real key, create one locally:
```bash
keytool -genkeypair -v -keystore stormblade.jks -alias stormblade \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 stormblade.jks    # macOS: base64 stormblade.jks
```
Then add these under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | the base64 blob above |
| `ANDROID_KEYSTORE_PASSWORD` | store password |
| `ANDROID_KEY_ALIAS` | `stormblade` |
| `ANDROID_KEY_PASSWORD` | key password |

**Keep `stormblade.jks` safe and never commit it.** Lose it and you can never
update the app on Play Store again.

---

## Building locally

### Windows `.exe`
On Windows (or macOS/Linux — Windows builds cross-compile fine for the portable
target; the NSIS installer prefers Windows or Wine):
```bash
npm install
npm run win:exe
```
Output lands in `release/`. To just try the desktop app without packaging:
```bash
npm run electron:dev
```
Electron config lives in `electron/main.cjs` — 1280×720 window, menu bar hidden,
F11 fullscreen, Esc to exit fullscreen, single-instance, external links open in
the real browser. Packaging options are the `build` block in `package.json`.

### Android `.apk`
Requires **JDK 21** and the **Android SDK** (easiest via Android Studio).
```bash
npm install
npm run android:apk          # debug APK
```
Result:
`android/app/build/outputs/apk/debug/app-debug.apk` — copy to your phone and
install (you'll need "install from unknown sources").

Other handy scripts:
```bash
npm run android:sync         # rebuild web assets + push into the native project
npm run android:open         # open the project in Android Studio
npm run android:apk:release  # unsigned release APK (must be signed before use)
```

If Gradle can't find your SDK, create `android/local.properties`:
```
sdk.dir=/Users/you/Library/Android/sdk
```
(Windows: `sdk.dir=C\:\\Users\\you\\AppData\\Local\\Android\\Sdk`)

---

## What was set up for Android

* `capacitor.config.ts` now points at `dist-app`.
* Launcher icons + adaptive icons + splash screens generated from `public/icon.svg`
  at every density, on the game's `#05060f` background.
* Manifest locked to **sensor landscape**, hardware acceleration on, touchscreen
  marked optional (so it's Chromebook/tablet friendly).
* `MainActivity.java` hides the status/nav bars for true fullscreen, draws behind
  display cutouts, and keeps the screen awake during play.
* `versionName 1.0.0` / `versionCode 1` — bump `versionCode` in
  `android/app/build.gradle` for every Play Store upload.

The `android/` project is committed so builds are reproducible; generated web
assets inside it (`app/src/main/assets/public`) stay ignored and are recreated by
`npx cap sync`.

---

## Play Store note

Google Play wants an **AAB**, not an APK:
```bash
npm run build:app && npx cap sync android
cd android && ./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`.
Use Play App Signing and upload that.

---

## Installing the CI workflow

The workflow file ships at **`ci/build-apps.yml`** rather than in
`.github/workflows/`, because the automation token used to push this branch is
not allowed to create workflow files. Activate it with one command:

```bash
mkdir -p .github/workflows && cp ci/build-apps.yml .github/workflows/
git add .github/workflows/build-apps.yml
git commit -m "Enable APK/EXE build workflow"
git push
```

(Or just create the file through the GitHub web UI: **Add file → Create new file**
→ name it `.github/workflows/build-apps.yml` → paste the contents of
`ci/build-apps.yml`.)

After that, **Actions → Build APK & EXE → Run workflow**.
