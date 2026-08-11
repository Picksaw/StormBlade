# STORMBLADE ⚡ Lightning Sword Arena

STORMBLADE is a polished, fast-paced action-runner hybrid built with React, TypeScript, and Canvas2D, developed and published by **Picksaw Studio**. It features tightly balanced sword throwing, teleportation mechanics, infinite wave scaling, and daily challenges.

Repository: [https://github.com/Picksaw/StormBlade](https://github.com/Picksaw/StormBlade)

---

## ⚡ Features
- **4 Game Modes:** Battle (endless survival), Race (speed dodge-runner), Blade Rush (shattering obstacles), and Lexicon (RTL/LTR wordplay solver).
- **Daily Challenges:** 6 daily quests that payout premium Gems to unlock elite, game-changing items.
- **Armory & Customisation:** 31 unique swordsmen skins (armor + health stats) and 31 unique blade shapes (reaching stats + elemental powers).
- **Pro Haptics & Synth Audio:** No static asset files; fully procedural synth sound design and dynamic, tense lo-fi lo-fi beats that react to gameplay intensity.
- **Worldwide Sync:** Account systems allowing fully cross-device synchronized wallets, skins, progress, and platform-specific leaderboards.

---

## 🛠️ Development & Deployment

The game builds into a **single self-contained `index.html`** file, housing all JavaScript, CSS, and procedural visual assets. It runs directly as a static file, on WampServer, Netlify, Cloudflare, or within a Telegram WebView.

### Local Setup
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/Picksaw/StormBlade.git
   cd StormBlade
   npm install
   ```

2. Run local hot-rebuilding server:
   ```bash
   npm run dev
   ```

3. Build production single-file package:
   ```bash
   npm run build
   ```

### Deploying the Leaderboard Worker
The background leaderboard runs on a free-tier Cloudflare Worker. Deploy script (`leaderboard-worker.js`) is included at the root level of this repository.

---

## 📄 License
Licensed under the [MIT License](./LICENSE) by Picksaw Studio.
