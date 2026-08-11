/**
 * STORMBLADE — ONLINE ACCOUNTS + GLOBAL LEADERBOARD
 * Cloudflare Worker (free tier, no credit card).
 *
 * This is what makes accounts actually mean something: every player
 * registers here, and everyone sees the same board.
 *
 * ── DEPLOY (about 10 minutes) ─────────────────────────────────────────
 * 1. https://dash.cloudflare.com  →  Workers & Pages  →  Create Worker
 *    Name it e.g. "stormblade-api", click Deploy, then "Edit code",
 *    delete the sample, paste THIS whole file, and Deploy again.
 *
 * 2. Create storage:  left menu → Storage & Databases → KV →
 *    Create namespace, name it "stormblade".
 *
 * 3. Bind it:  your Worker → Settings → Bindings → Add → KV namespace
 *    Variable name MUST be exactly:  BOARD
 *    Namespace: stormblade  → Save & Deploy.
 *
 * 4. Copy your worker URL, e.g.
 *      https://stormblade-api.yourname.workers.dev
 *
 * 5. In the game source open  src/game/meta.ts  and set:
 *      export const LEADERBOARD_API = 'https://stormblade-api.yourname.workers.dev';
 *
 * 6. npm run build  → re-upload dist/index.html.
 *    Now James and Alex see each other's scores. Done.
 * ──────────────────────────────────────────────────────────────────────
 *
 * ROUTES
 *   POST /register  {user, pass}                          → create account
 *   POST /login     {user, pass}                          → sign in (returns profile)
 *   POST /submit    {user, token, mode, score, wave, blade, platform}
 *   POST /profile   {user, token, profile}                → save coins/skins/maps
 *   GET  /board?mode=battle|race|rush                     → top 50
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/* --------------------------------------------------------------- utils */

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const randHex = (n = 16) => {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Same rules the client enforces — never trust the client alone.
const BANNED = [
  'nigg','chink','gook','kike','spic','coon','tranny','faggot','fag','retard','fuck','fuk','shit','sh1t',
  'cunt','twat','bitch','whore','slut','bastard','dick','cock','penis','vagina','pussy','anal','anus','ass',
  'sex','porn','milf','dildo','cum','jizz','rape','pedo','incest','nazi','hitler','kkk','kys','admin',
  'moderator','official','picksaw','piksaw','system',
];

function normalize(s) {
  return String(s).toLowerCase()
    .replace(/0/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g')
    .replace(/[^a-z]/g, '');
}

function badName(name) {
  if (!name || name.length < 3 || name.length > 14) return 'name_bad';
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) return 'name_charset';
  const flat = normalize(name);
  for (const b of BANNED) if (flat.includes(normalize(b))) return 'name_banned';
  return null;
}

const MODES = ['battle', 'race', 'rush', 'word'];
const boardKey = (m) => `board:${MODES.includes(m) ? m : 'battle'}`;
const userKey = (u) => `user:${u.toLowerCase()}`;

/* --------------------------------------------------------------- routes */

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (!env.BOARD) return json({ ok: false, error: 'kv_not_bound' }, 500);

    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      /* ---------------------------------------------------- GET /board */
      if (req.method === 'GET') {
        const mode = url.searchParams.get('mode') || 'battle';
        const raw = (await env.BOARD.get(boardKey(mode))) || '[]';
        return new Response(raw, { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }

      const body = await req.json().catch(() => ({}));

      /* ------------------------------------------------ POST /register */
      if (path === '/register') {
        const user = String(body.user || '').trim();
        const pass = String(body.pass || '');
        const nameErr = badName(user);
        if (nameErr) return json({ ok: false, error: nameErr });
        if (pass.length < 4) return json({ ok: false, error: 'pw_short' });

        const existing = await env.BOARD.get(userKey(user));
        if (existing) return json({ ok: false, error: 'name_taken' });

        const salt = randHex(8);
        const hash = await sha256(`${salt}::${pass}`);
        const token = randHex(20);
        const acc = {
          display: user, salt, hash, token, created: Date.now(),
          battle: 0, race: 0, rush: 0, wave: 0, sector: 0, broken: 0,
          bladeBattle: '', bladeRace: '', bladeRush: '',
          // full player progress lives here so it follows the account
          profile: null,
        };
        await env.BOARD.put(userKey(user), JSON.stringify(acc));
        return json({ ok: true, user, token, profile: null });
      }

      /* --------------------------------------------------- POST /login */
      if (path === '/login') {
        const user = String(body.user || '').trim();
        const pass = String(body.pass || '');
        const raw = await env.BOARD.get(userKey(user));
        if (!raw) return json({ ok: false, error: 'no_user' });
        const acc = JSON.parse(raw);
        const hash = await sha256(`${acc.salt}::${pass}`);
        if (hash !== acc.hash) return json({ ok: false, error: 'bad_pw' });
        // rotate a fresh token on each login
        acc.token = randHex(20);
        await env.BOARD.put(userKey(user), JSON.stringify(acc));
        return json({
          ok: true, user: acc.display, token: acc.token,
          best: {
            battle: acc.battle, race: acc.race, rush: acc.rush,
            wave: acc.wave, sector: acc.sector, broken: acc.broken,
            bladeBattle: acc.bladeBattle, bladeRace: acc.bladeRace, bladeRush: acc.bladeRush,
          },
          // coins, owned swords/heroes/maps, equipped gear, language
          profile: acc.profile || null,
        });
      }

      /* ------------------------------------------------- POST /profile */
      if (path === '/profile') {
        const user = String(body.user || '').trim();
        const token = String(body.token || '');
        const raw = await env.BOARD.get(userKey(user));
        if (!raw) return json({ ok: false, error: 'no_user' });
        const acc = JSON.parse(raw);
        if (!token || token !== acc.token) return json({ ok: false, error: 'bad_token' });

        const p = body.profile || {};
        const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 200) : []);
        const incoming = {
          coins: Math.max(0, Math.min(99_999_999, Math.floor(Number(p.coins) || 0))),
          hero: String(p.hero || 'storm').slice(0, 40),
          sword: String(p.sword || 'storm-blade').slice(0, 40),
          map: String(p.map || 'storm').slice(0, 40),
          ownedHeroes: arr(p.ownedHeroes),
          ownedSwords: arr(p.ownedSwords),
          ownedMaps: arr(p.ownedMaps),
          lang: p.lang === 'fa' ? 'fa' : 'en',
        };

        // merge with whatever the server already knows (never lose purchases)
        const old = acc.profile;
        acc.profile = old
          ? {
              ...incoming,
              coins: Math.max(old.coins || 0, incoming.coins),
              ownedHeroes: [...new Set([...(old.ownedHeroes || []), ...incoming.ownedHeroes])],
              ownedSwords: [...new Set([...(old.ownedSwords || []), ...incoming.ownedSwords])],
              ownedMaps: [...new Set([...(old.ownedMaps || []), ...incoming.ownedMaps])],
            }
          : incoming;

        await env.BOARD.put(userKey(user), JSON.stringify(acc));
        return json({ ok: true, profile: acc.profile });
      }

      /* -------------------------------------------------- POST /submit */
      if (path === '/submit') {
        const user = String(body.user || '').trim();
        const token = String(body.token || '');
        const mode = MODES.includes(body.mode) ? body.mode : 'battle';
        const score = Math.floor(Number(body.score) || 0);
        const wave = Math.max(0, Math.floor(Number(body.wave) || 0));
        const blade = String(body.blade || '').slice(0, 40);
        const kills = Math.max(0, Math.floor(Number(body.kills) || 0));
        // NOTE: must match the client exactly, otherwise everything silently
        // falls back to 'pc' — which is what broke Android detection before.
        const okPlat = ['pc', 'android'];
        const platform = okPlat.includes(body.platform) ? body.platform : 'pc';

        const raw = await env.BOARD.get(userKey(user));
        if (!raw) return json({ ok: false, error: 'no_user' });
        const acc = JSON.parse(raw);
        if (!token || token !== acc.token) return json({ ok: false, error: 'bad_token' });
        if (score <= 0 || score > 50_000_000) return json({ ok: false, error: 'bad_score' });

        // only keep personal bests
        if (score > (acc[mode] || 0)) {
          acc[mode] = score;
          if (mode === 'battle') { acc.wave = Math.max(acc.wave || 0, wave); acc.bladeBattle = blade; }
          if (mode === 'race') { acc.sector = Math.max(acc.sector || 0, wave); acc.bladeRace = blade; }
          if (mode === 'rush') { acc.broken = Math.max(acc.broken || 0, wave); acc.bladeRush = blade; }
          await env.BOARD.put(userKey(user), JSON.stringify(acc));

          // update the shared board for this mode
          const bKey = boardKey(mode);
          const board = JSON.parse((await env.BOARD.get(bKey)) || '[]');
          const key = acc.display.toLowerCase();
          const row = board.find((r) => String(r.name).toLowerCase() === key);
          if (row) {
            row.score = score;
            row.wave = wave;
            row.kills = kills;
            row.blade = blade;
            row.platform = platform;
            row.ts = Date.now();
          } else {
            board.push({ name: acc.display, score, wave, kills, blade, platform, ts: Date.now() });
          }
          board.sort((a, b) => b.score - a.score);
          await env.BOARD.put(bKey, JSON.stringify(board.slice(0, 50)));
        }
        return json({ ok: true });
      }

      /* --------------------------------------------------- POST /reset
       * Admin wipe. Clears leaderboards so you can start a fresh season
       * after an update. Accounts (and their coins/skins) are preserved
       * unless you pass  wipeAccounts: true.
       *
       * Set ADMIN_KEY in  Worker → Settings → Variables and Secrets.
       * Body: { key: "<ADMIN_KEY>", mode?: "battle|race|rush|word|all",
       *         wipeAccounts?: false }
       */
      if (path === '/reset') {
        const key = String(body.key || '');
        if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ ok: false, error: 'bad_key' }, 403);

        const mode = String(body.mode || 'all');
        const targets = mode === 'all' ? MODES : MODES.includes(mode) ? [mode] : [];
        for (const m of targets) await env.BOARD.put(boardKey(m), '[]');

        // also clear the personal bests stored on each account
        let cleared = 0;
        let cursor;
        do {
          const page = await env.BOARD.list({ prefix: 'user:', cursor });
          for (const k of page.keys) {
            if (body.wipeAccounts === true) {
              await env.BOARD.delete(k.name);
              cleared++;
              continue;
            }
            const raw = await env.BOARD.get(k.name);
            if (!raw) continue;
            const acc = JSON.parse(raw);
            for (const m of targets) acc[m] = 0;
            if (targets.includes('battle')) { acc.wave = 0; acc.bladeBattle = ''; }
            if (targets.includes('race')) { acc.sector = 0; acc.bladeRace = ''; }
            if (targets.includes('rush')) { acc.broken = 0; acc.bladeRush = ''; }
            await env.BOARD.put(k.name, JSON.stringify(acc));
            cleared++;
          }
          cursor = page.list_complete ? null : page.cursor;
        } while (cursor);

        return json({ ok: true, modes: targets, accountsTouched: cleared, wiped: body.wipeAccounts === true });
      }

      return json({ ok: false, error: 'not_found' }, 404);
    } catch (e) {
      return json({ ok: false, error: 'server' }, 500);
    }
  },
};
