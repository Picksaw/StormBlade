import { useCallback, useEffect, useRef, useState } from 'react';
import { Game, type GameState, type Hud } from './game/engine';
import { Renderer } from './game/render';
import { Input } from './game/input';
import { music, sfx } from './game/audio';
import { clamp, loadScores, mergeBoards, persistScores, saveScore, type HighScore } from './game/core';
import { isTelegram, tgBackButton, tgInit, tgLoadScores, tgSaveScores, tgUserName } from './game/telegram';
import { altGemCostOf, coinCostOf, gemPriceOf, heroById, mapById, swordById, swordPowerOf } from './game/skins';
import {
  coinsForScore,
  defaultProfile,
  fetchGlobalScores,
  loadGuestProfile,
  loadProfile,
  saveGuestProfile,
  mergeProfile,
  pullCloudProfile,
  pushGlobalScore,
  resolveName,
  saveProfileEverywhere,
  type Profile,
} from './game/meta';
import { ArmoryScreen, AuthScreen, DailyScreen, GameOverScreen, HudLayer, PauseScreen } from './components/Ui';
import { GuideScreen, StartScreen } from './components/Menu';
import {
  applyRun,
  canClaim,
  challengeById,
  loadDaily,
  saveDaily,
  type ChallengeId,
  type DailyState,
} from './game/daily';
import {
  accountBoard,
  currentAccount,
  detectPlatform,
  fetchOnlineBoard,
  isOnline,
  loginAccount,
  logout as authLogout,
  mergeAccounts,
  pullCloudAccounts,
  recordRun,
  registerAccount,
  submitOnlineScore,
  syncProfileUp,
} from './game/auth';

const EMPTY_HUD: Hud = {
  mode: 'battle',
  score: 0,
  wave: 1,
  hp: 5,
  maxHp: 5,
  combo: 0,
  mult: 1,
  kills: 0,
  charge: 0,
  overcharge: 0,
  might: 0,
  tri: 0,
  freeze: 0,
  score2x: 0,
  blinkFree: 0,
  speedBoost: 0,
  slowMo: 0,
  hyperSpeed: 0,
  ghostPass: 0,
  magnet: 0,
  shieldOrb: 0,
  swordOut: false,
};

type RunResult = {
  mode: 'battle' | 'race' | 'rush' | 'word';
  score: number;
  wave: number;
  kills: number;
  bestCombo: number;
  rank: number;
  coinsEarned: number;
  coinsTotal: number;
  sector?: number;
  dodged?: number;
  broken?: number;
};

export default function App() {
  const shellRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const inputRef = useRef<Input | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const phaseRef = useRef<GameState>('menu');
  const overAtRef = useRef(0);
  const overTimerRef = useRef(0);
  const qualityRef = useRef(2);
  const globalBoardRef = useRef<HighScore[]>([]);

  const profileRef = useRef<Profile>(loadProfile());

  const [phase, setPhaseState] = useState<GameState>('menu');
  const [hud, setHud] = useState<Hud>(EMPTY_HUD);
  const [scores, setScores] = useState<HighScore[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [muted, setMuted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [profile, setProfile] = useState<Profile>(profileRef.current);
  const [showArmory, setShowArmory] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const guideOpenRef = useRef(false);
  const [daily, setDaily] = useState<DailyState>(() => loadDaily());
  const dailyOpenRef = useRef(false);
  const [account, setAccount] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'battle' | 'race' | 'rush' | 'word'>('battle');
  const armoryRef = useRef(false);
  const accountRef = useRef<string | null>(null);
  const authOpenRef = useRef(false);

  if (!gameRef.current) gameRef.current = new Game();
  if (!inputRef.current) inputRef.current = new Input();

  const setPhase = useCallback((p: GameState) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const syncTimer = useRef(0);
  const updateProfile = useCallback((fn: (p: Profile) => Profile) => {
    const np = fn(profileRef.current);
    profileRef.current = np;
    saveProfileEverywhere(np);
    setProfile(np);
    if (accountRef.current) {
      // debounce-push coins / purchases / equipped gear to the account
      window.clearTimeout(syncTimer.current);
      syncTimer.current = window.setTimeout(() => void syncProfileUp(profileRef.current), 600);
    } else {
      // playing as guest — keep the device snapshot in step
      saveGuestProfile(np);
    }
  }, []);

  const setArmory = useCallback((v: boolean) => {
    armoryRef.current = v;
    setShowArmory(v);
  }, []);

  const toggleLang = useCallback(() => {
    sfx.ui();
    updateProfile((p) => ({ ...p, lang: p.lang === 'fa' ? 'en' : 'fa' }));
  }, [updateProfile]);

  /** Displayed board = registered accounts + this device's runs + any global rows. */
  const refreshScores = useCallback((local: HighScore[], mode: 'battle' | 'race' | 'rush' | 'word' = 'battle') => {
    const accounts = accountBoard(mode) as HighScore[];
    // Offline build: fall back to whatever this device knows.
    if (!isOnline()) {
      setScores(mergeBoards(accounts, local));
      return;
    }
    // Online build: the SERVER is the single source of truth. Mixing in stale
    // local rows is what made the phone and PC boards disagree.
    setScores(globalBoardRef.current);
    void fetchOnlineBoard(mode).then((rows) => {
      if (!rows) return;
      const online: HighScore[] = rows.map((r) => ({
        name: r.name || 'Wanderer',
        score: r.score,
        wave: r.wave || 0,
        kills: (r as { kills?: number }).kills || 0,
        date: 0,
        mode,
        blade: r.blade,
        platform: (r as { platform?: HighScore['platform'] }).platform,
      }));
      globalBoardRef.current = online;
      setScores(online);
    });
  }, []);

  const openAuth = useCallback(() => {
    sfx.ui();
    inputRef.current?.clear();
    authOpenRef.current = true;
    setShowAuth(true);
  }, []);

  const closeAuth = useCallback(() => {
    inputRef.current?.clear();
    authOpenRef.current = false;
    setShowAuth(false);
  }, []);

  const doLogin = useCallback(
    async (u: string, p: string) => {
      const res = await loginAccount(u, p);
      if (!res.ok) return res.error;
      // Signing in must NEVER carry the guest wallet into the account.
      // Stash the device profile, then load THIS ACCOUNT's own progress.
      if (!accountRef.current) saveGuestProfile(profileRef.current);
      accountRef.current = res.account.user;
      setAccount(res.account.display);

      const sp = res.profile as Partial<Profile> | null | undefined;
      updateProfile((prev) => {
        const fresh = defaultProfile();
        const next: Profile = {
          ...fresh,
          // language is a device preference, not account progress
          lang: prev.lang,
          name: res.account.display,
        };
        if (sp) {
          next.coins = Math.max(0, Number(sp.coins) || 0);
          next.gems = Math.max(0, Number(sp.gems) || 0);
          next.ownedHeroes = [...new Set([...fresh.ownedHeroes, ...((sp.ownedHeroes as string[]) || [])])];
          next.ownedSwords = [...new Set([...fresh.ownedSwords, ...((sp.ownedSwords as string[]) || [])])];
          next.ownedMaps = [...new Set([...fresh.ownedMaps, ...((sp.ownedMaps as string[]) || [])])];
          if (sp.hero && next.ownedHeroes.includes(sp.hero as string)) next.hero = sp.hero as string;
          if (sp.sword && next.ownedSwords.includes(sp.sword as string)) next.sword = sp.sword as string;
          if (sp.map && next.ownedMaps.includes(sp.map as string)) next.map = sp.map as string;
        }
        void syncProfileUp(next);
        return next;
      });
      sfx.heal();
      closeAuth();
      refreshScores(loadScores(gameMode), gameMode);
      return null;
    },
    [closeAuth, refreshScores, gameMode, updateProfile],
  );

  const doRegister = useCallback(
    async (u: string, p: string) => {
      const res = await registerAccount(u, p);
      if (!res.ok) return res.error;
      // a brand-new account starts from zero — the guest wallet stays behind
      if (!accountRef.current) saveGuestProfile(profileRef.current);
      accountRef.current = res.account.user;
      setAccount(res.account.display);
      updateProfile((prev) => {
        const next: Profile = { ...defaultProfile(), lang: prev.lang, name: res.account.display };
        void syncProfileUp(next);
        return next;
      });
      sfx.overcharge();
      closeAuth();
      refreshScores(loadScores(gameMode), gameMode);
      return null;
    },
    [closeAuth, refreshScores, gameMode, updateProfile],
  );

  /* ------------------------------------------------------ daily challenges */
  const openDaily = useCallback(() => {
    sfx.ui();
    inputRef.current?.clear();
    setDaily(loadDaily()); // re-check the date in case it rolled over
    dailyOpenRef.current = true;
    setShowDaily(true);
  }, []);

  const closeDaily = useCallback(() => {
    inputRef.current?.clear();
    dailyOpenRef.current = false;
    setShowDaily(false);
  }, []);

  const claimDaily = useCallback(
    (id: ChallengeId) => {
      setDaily((prev) => {
        if (!canClaim(prev, id)) return prev;
        const next: DailyState = { ...prev, claimed: { ...prev.claimed, [id]: true } };
        saveDaily(next);
        const reward = challengeById(id).gems;
        updateProfile((p) => ({ ...p, gems: (p.gems || 0) + reward }));
        sfx.gem();
        return next;
      });
    },
    [updateProfile],
  );

  const dailyReady = daily.picks.filter((id) => canClaim(daily, id)).length;

  const doLogout = useCallback(() => {
    sfx.ui();
    // make sure the account keeps its final state before we detach
    if (accountRef.current) void syncProfileUp(profileRef.current);
    authLogout();
    accountRef.current = null;
    setAccount(null);
    // hand the device its own wallet back — account coins do NOT come along
    const guest = loadGuestProfile();
    profileRef.current = guest;
    saveProfileEverywhere(guest);
    setProfile(guest);
    refreshScores(loadScores(gameMode), gameMode);
  }, [refreshScores, gameMode]);

  /* ------------------------------------------------------------- boot */
  useEffect(() => {
    setScores(loadScores());
    // restore an existing signed-in account
    const acc = currentAccount();
    if (acc) {
      accountRef.current = acc.user;
      setAccount(acc.display);
    }
    void pullCloudAccounts().then((raw) => {
      mergeAccounts(raw);
      const a = currentAccount();
      if (a) {
        accountRef.current = a.user;
        setAccount(a.display);
      }
      refreshScores(loadScores());
    });
    const touch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || isTelegram();
    setIsTouch(touch);
    if (inputRef.current) inputRef.current.isTouch = touch;

    // Telegram Mini App: expand, track stable viewport, merge cloud profile + scores
    tgInit((h) => {
      if (shellRef.current) shellRef.current.style.height = `${h}px`;
    });
    void pullCloudProfile().then((raw) => {
      const merged = mergeProfile(profileRef.current, raw, tgUserName());
      profileRef.current = merged;
      saveProfileEverywhere(merged);
      setProfile(merged);
    });
    void tgLoadScores().then((raw) => {
      if (!raw) return;
      try {
        const cloud = JSON.parse(raw);
        if (!Array.isArray(cloud)) return;
        const asScores: HighScore[] = cloud
          .filter((s: HighScore) => s && typeof s.score === 'number')
          .map((s: HighScore) => ({ ...s, name: s.name || 'Wanderer' }));
        const merged = mergeBoards(loadScores(), asScores);
        persistScores(merged);
        tgSaveScores(JSON.stringify(merged));
        refreshScores(merged);
      } catch {
        /* ignore corrupt payload */
      }
    });
    // Global leaderboard (see meta.ts — set LEADERBOARD_API to your worker URL)
    void fetchGlobalScores().then((g) => {
      if (!g) return;
      const asScores: HighScore[] = g
        .filter((s) => s && typeof s.score === 'number')
        .map((s) => ({ name: s.name || 'Wanderer', score: s.score, wave: s.wave || 1, kills: 0, date: 0 }));
      globalBoardRef.current = asScores;
      refreshScores(loadScores());
    });
  }, [refreshScores]);

  /* ------------------------------------------------------------- actions */
  const startGame = useCallback(() => {
    sfx.init();
    sfx.ui();
    music.start();
    const g = gameRef.current!;
    window.clearTimeout(overTimerRef.current);
    inputRef.current!.clear();
    armoryRef.current = false;
    authOpenRef.current = false;
    dailyOpenRef.current = false;
    guideOpenRef.current = false;
    setShowArmory(false);
    setShowAuth(false);
    setShowDaily(false);
    setShowGuide(false);
    setHud(EMPTY_HUD);
    g.mode = gameMode;
    g.reset();
    setResult(null);
    setPhase('playing');
  }, [setPhase, gameMode]);

  const goMenu = useCallback(() => {
    sfx.ui();
    music.stop();
    const g = gameRef.current!;
    g.reset();
    g.state = 'menu';
    g.px = g.W / 2;
    g.py = g.H / 2;
    inputRef.current!.clear();
    setPhase('menu');
    refreshScores(loadScores(gameMode), gameMode);
  }, [setPhase, refreshScores, gameMode]);

  const switchMode = useCallback(
    (m: 'battle' | 'race' | 'rush' | 'word') => {
      sfx.ui();
      setGameMode(m);
      gameRef.current!.mode = m;
      refreshScores(loadScores(m), m);
    },
    [refreshScores],
  );

  const togglePause = useCallback(() => {
    const g = gameRef.current!;
    if (phaseRef.current === 'playing') {
      g.state = 'paused';
      inputRef.current!.clear();
      setPhase('paused');
      sfx.ui();
      music.stop();
    } else if (phaseRef.current === 'paused') {
      g.state = 'playing';
      inputRef.current!.clear();
      setPhase('playing');
      sfx.ui();
      music.start();
    }
  }, [setPhase]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      sfx.setMuted(!m);
      music.setMuted(!m);
      return !m;
    });
  }, []);

  const buySkin = useCallback(
    (kind: 'hero' | 'sword' | 'map', id: string, withGems = false) => {
      inputRef.current?.clear();
      const p = profileRef.current;
      const list = kind === 'hero' ? [...p.ownedHeroes] : kind === 'sword' ? [...p.ownedSwords] : [...p.ownedMaps];
      if (list.includes(id)) return;

      const own = (spend: Partial<Profile>) => {
        list.push(id);
        updateProfile((prev) => ({
          ...prev,
          ...spend,
          ownedHeroes: kind === 'hero' ? list : prev.ownedHeroes,
          ownedSwords: kind === 'sword' ? list : prev.ownedSwords,
          ownedMaps: kind === 'map' ? list : prev.ownedMaps,
          hero: kind === 'hero' ? id : prev.hero,
          sword: kind === 'sword' ? id : prev.sword,
          map: kind === 'map' ? id : prev.map,
        }));
      };

      // 1. gem-exclusive end-game items
      const exclusive = gemPriceOf(id);
      if (exclusive > 0) {
        if ((p.gems || 0) < exclusive) return;
        sfx.gem();
        own({ gems: (p.gems || 0) - exclusive });
        return;
      }

      // maps keep their original coin price; blades/heroes use the new curve
      const coinPrice = kind === 'map' ? mapById(id).cost : coinCostOf(id);

      // 2. paying with gems
      if (withGems) {
        const alt = altGemCostOf(id) || Math.max(50, Math.round(coinPrice / 45 / 5) * 5);
        if ((p.gems || 0) < alt) return;
        sfx.gem();
        own({ gems: (p.gems || 0) - alt });
        return;
      }

      // 3. paying with coins
      if (p.coins < coinPrice) return;
      sfx.pickup();
      own({ coins: p.coins - coinPrice });
    },
    [updateProfile],
  );

  const equipSkin = useCallback(
    (kind: 'hero' | 'sword' | 'map', id: string) => {
      inputRef.current?.clear();
      const p = profileRef.current;
      const owned = kind === 'hero' ? p.ownedHeroes : kind === 'sword' ? p.ownedSwords : p.ownedMaps;
      if (!owned.includes(id)) return;
      sfx.ui();
      updateProfile((prev) => ({
        ...prev,
        hero: kind === 'hero' ? id : prev.hero,
        sword: kind === 'sword' ? id : prev.sword,
        map: kind === 'map' ? id : prev.map,
      }));
    },
    [updateProfile],
  );

  /* ------------------------------------------------------------ main loop */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const game = gameRef.current!;
    const input = inputRef.current!;
    const renderer = new Renderer(canvas);
    rendererRef.current = renderer;
    renderer.heroSkin = heroById(profileRef.current.hero);
    renderer.swordSkin = swordById(profileRef.current.sword);
    renderer.mapSkin = mapById(profileRef.current.map);
    renderer.lang = profileRef.current.lang;
    game.lang = profileRef.current.lang;
    game.dustColor = renderer.heroSkin.dust;
    const bootHero = heroById(profileRef.current.hero);
    game.swordPower = swordPowerOf(profileRef.current.sword);
    game.armor = bootHero.armor;
    game.extraHp = bootHero.extraHp;
    game.speedMult = bootHero.speedMult;

    game.onMapChange = (ms) => renderer.setMap(ms);
    game.onCombo = (lvl) => sfx.combo(lvl);
    game.onBladeChange = () => {
      /* blade visuals read straight from game.rushBlade each frame */
    };
    game.onHud = (h) => setHud(h);
    game.onGameOver = (score, wave, kills) => {
      overAtRef.current = performance.now();
      const earned = coinsForScore(score);
      updateProfile((p) => ({ ...p, coins: p.coins + earned }));
      const total = profileRef.current.coins;
      const name = resolveName(profileRef.current);
      const mode = game.mode;
      let sector = game.sector;
      const dodged = game.obstaclesDodged;
      const broken = mode === 'word' ? game.wordsDone : game.obstaclesBroken;
      if (mode === 'word') sector = game.wordPhase;
      // which blade finished the run — shown on the leaderboard
      const bladeId = mode === 'rush' ? game.rushBlade.id : profileRef.current.sword;
      // persist the run onto the signed-in account so it lands on the board
      if (accountRef.current) recordRun(accountRef.current, mode, score, wave, mode === 'rush' ? broken : sector, bladeId);
      const entry: HighScore = {
        name,
        score,
        // in Lexicon we reuse wave/kills as solved/failed word counts
        wave: mode === 'word' ? game.wordsDone : wave,
        kills: mode === 'word' ? game.wordsFailed : kills,
        date: Date.now(),
        mode,
        blade: bladeId,
        platform: detectPlatform(),
      };
      const { list, rank } = saveScore(entry, mode);
      const bestCombo = game.bestCombo;
      // fold this run into today's challenge progress
      setDaily((prev) => {
        const next = applyRun(prev, {
          mode,
          score,
          kills,
          wave,
          bestCombo: game.bestCombo,
          combos: game.combosHit,
          gems: game.gemsCollected,
          sector: game.sector,
          broken,
          wordsDone: game.wordsDone,
          phase: game.wordPhase,
          bossKills: game.bossKills,
        });
        saveDaily(next);
        return next;
      });
      // banked gems picked up during the run
      if (game.gemsCollected > 0) {
        updateProfile((p) => ({ ...p, gems: (p.gems || 0) + game.gemsCollected }));
      }

      // push to the shared online board so every player competes together
      void submitOnlineScore(
        mode,
        score,
        mode === 'word' ? game.wordsDone : mode === 'rush' ? broken : mode === 'race' ? sector : wave,
        bladeId,
        mode === 'word' ? game.wordsFailed : kills,
      );
      void pushGlobalScore({ name, score, wave, mode });
      // let the death explosion breathe before the panel drops in
      window.clearTimeout(overTimerRef.current);
      overTimerRef.current = window.setTimeout(() => {
        refreshScores(list, mode);
        setResult({ mode, score, wave, kills, bestCombo, rank, coinsEarned: earned, coinsTotal: total, sector, dodged, broken });
        setPhase('over');
      }, 850);
      tgSaveScores(JSON.stringify(list), mode);
      music.stop();
    };

    input.onPause = () => {
      if (phaseRef.current === 'playing' || phaseRef.current === 'paused') togglePause();
    };
    input.onAnyInput = () => sfx.init();
    input.attach(wrap);

    const applyResize = () => {
      const cssW = Math.max(320, wrap.clientWidth);
      const cssH = Math.max(360, wrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, qualityRef.current);
      const scale = clamp(Math.hypot(cssW, cssH) / 1150, 0.62, 1.4);
      renderer.resize(cssW, cssH, scale, dpr);
      game.resize(cssW / scale, cssH / scale);
      input.resize(cssW, cssH, scale);
    };
    applyResize();

    const ro = new ResizeObserver(() => applyResize());
    ro.observe(wrap);
    window.addEventListener('orientationchange', applyResize);

    const onVis = () => {
      if (document.hidden && phaseRef.current === 'playing') togglePause();
    };
    const onBlur = () => {
      if (phaseRef.current === 'playing') togglePause();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);

    const STEP = 1 / 60;
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    let slow = 0;
    let downgraded = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.25) dt = 0.25;

      // adaptive quality: drop resolution if we're consistently behind
      if (!downgraded) {
        if (dt > 0.026) slow++;
        else slow = Math.max(0, slow - 1);
        if (slow > 90) {
          downgraded = true;
          qualityRef.current = 1;
          applyResize();
        }
      }

      input.sample();
      const phase = phaseRef.current;

      if (phase === 'playing' && game.state === 'playing') {
        if (game.hitStop > 0) {
          game.hitStop -= dt;
        } else {
          // consume both primary sources in one shot so Space+LMB
          // can't double-fire blink on successive frames
          const pri = input.consumePrimary();
          const sec = input.consumeSecondary();
          if (pri) game.blink();
          if (sec) game.slash();
          acc += dt * game.timeScale;
          let iter = 0;
          while (acc >= STEP && iter < 5) {
            game.update(STEP, input);
            acc -= STEP;
            iter++;
            if (game.hitStop > 0) break;
          }
          if (acc > STEP * 5) acc = 0;
        }
      } else {
        acc = 0;
        game.update(Math.min(dt, STEP * 2), input);
        if (phase === 'menu' && input.consumePrimary()) {
          // On the menu, ONLY keyboard shortcuts (Space/Enter) start the game.
          // The canvas is hidden during the menu phase so all real pointer events
          // come from the React menu UI, which calls startGame() directly.
          // This branch therefore only fires for keyboard users.
          if (!armoryRef.current && !authOpenRef.current && !dailyOpenRef.current && !guideOpenRef.current) startGame();
        } else if (phase === 'over' && now - overAtRef.current > 1500 && input.consumePrimary()) {
          startGame();
        } else {
          input.consumePrimary();
          input.consumeSecondary();
        }
      }

      // keep the lo-fi track scheduled + reactive to tension
      music.update();
      if (phaseRef.current === 'playing') {
        const tension =
          game.mode === 'race' ? game.raceRamp() : clamp((game.wave - 1) / 20 + (game.hp <= 2 ? 0.3 : 0), 0, 1);
        music.setIntensity(tension);
      }

      renderer.draw(game, input, phaseRef.current === 'playing' ? 1 : 0);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(overTimerRef.current);
      ro.disconnect();
      window.removeEventListener('orientationchange', applyResize);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      input.detach();
      game.onHud = undefined;
      game.onGameOver = undefined;
    };
  }, [setPhase, startGame, togglePause, updateProfile, refreshScores]);

  /* ------------------------------------------- cosmetics & language apply */
  useEffect(() => {
    const r = rendererRef.current;
    const g = gameRef.current;
    if (r && g) {
      r.heroSkin = heroById(profile.hero);
      r.swordSkin = swordById(profile.sword);
      r.setMap(mapById(profile.map));
      r.lang = profile.lang;
      g.lang = profile.lang;
      g.mapSkin = mapById(profile.map);
      g.dustColor = r.heroSkin.dust;
      g.swordPower = swordPowerOf(profile.sword);
      // BUGFIX: armor was applied but extraHp/speedMult never were, so the
      // "+N HP" and "% SPD" stats on hero cards did literally nothing.
      const hero = heroById(profile.hero);
      g.armor = hero.armor;
      g.extraHp = hero.extraHp;
      g.speedMult = hero.speedMult;
    }
  }, [profile.hero, profile.sword, profile.map, profile.lang]);

  /* ------------------------------------------------------ keyboard extras */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA')) return;
      const k = e.key.toLowerCase();
      if (k === 'r' && (phaseRef.current === 'over' || phaseRef.current === 'paused')) {
        e.preventDefault();
        startGame();
      }
      if (k === 'enter' && !armoryRef.current && !authOpenRef.current && !dailyOpenRef.current) {
        if (phaseRef.current === 'menu' || phaseRef.current === 'over') {
          e.preventDefault();
          startGame();
        }
      }
      if (k === 'm') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [startGame, toggleMute]);

  /* Telegram hardware/software Back button pauses the run */
  useEffect(() => {
    tgBackButton(phase === 'playing', togglePause);
  }, [phase, togglePause]);

  const displayName = resolveName(profile);
  const lang = profile.lang;

  return (
    <div
      ref={shellRef}
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#05060f]"
    >
      {/* Canvas layer — hidden while on the menu so the game arena never shows through */}
      <div
        ref={wrapRef}
        className={`no-touch absolute inset-0 h-full w-full overflow-hidden transition-opacity duration-300 ${phase === 'menu' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full ${phase === 'playing' && !isTouch ? 'cursor-crosshair' : ''}`}
        />

        {phase === 'playing' && (
          <HudLayer
            hud={hud}
            coins={profile.coins}
            lang={lang}
            armor={heroById(profile.hero).armor}
            onPause={togglePause}
            muted={muted}
            onMute={toggleMute}
          />
        )}

        {phase === 'paused' && (
          <PauseScreen
            onResume={togglePause}
            onRestart={startGame}
            onQuit={goMenu}
            muted={muted}
            onMute={toggleMute}
            lang={lang}
            onLang={toggleLang}
          />
        )}

        {phase === 'over' && result && (
          <GameOverScreen
            score={result.score}
            wave={result.wave}
            kills={result.kills}
            bestCombo={result.bestCombo}
            rank={result.rank}
            scores={scores}
            coinsEarned={result.coinsEarned}
            coinsTotal={result.coinsTotal}
            onRestart={startGame}
            onQuit={goMenu}
            onRevive={() => {
              const g = gameRef.current!;
              const cost = g.reviveCost();
              if (cost > 0 && profile.coins >= cost) {
                updateProfile((p) => ({ ...p, coins: p.coins - cost }));
                g.revive();
                setPhase('playing');
                setResult(null);
                music.start();
              }
            }}
            reviveCost={gameRef.current?.reviveCost() ?? 0}
            canRevive={gameRef.current?.canRevive ?? false}
            playerCoins={profile.coins}
            isTouch={isTouch}
            lang={lang}
            mode={result.mode}
            sector={result.sector}
            dodged={result.mode === 'rush' || result.mode === 'word' ? result.broken : result.dodged}
          />
        )}

        {showArmory && phase === 'menu' && (
          <ArmoryScreen
            profile={profile}
            onClose={() => {
              inputRef.current?.clear();
              setArmory(false);
            }}
            onBuy={buySkin}
            onEquip={equipSkin}
            lang={lang}
          />
        )}
      </div>

      {/* Main menu — fullscreen under the modals */}
      {phase === 'menu' && (
        <StartScreen
          onStart={startGame}
          onArmory={() => {
            sfx.ui();
            inputRef.current?.clear();
            setArmory(true);
          }}
          mode={gameMode}
          onMode={switchMode}
          scores={scores}
          isTouch={isTouch}
          coins={profile.coins}
          gems={profile.gems || 0}
          daily={daily}
          onDaily={openDaily}
          dailyReady={dailyReady}
          onGuide={() => {
            sfx.ui();
            inputRef.current?.clear();
            guideOpenRef.current = true;
            setShowGuide(true);
          }}
          name={displayName}
          nameLocked={isTelegram()}
          onName={(n) => updateProfile((p) => ({ ...p, name: n }))}
          lang={lang}
          onLang={toggleLang}
          account={account}
          onAuth={openAuth}
          onLogout={doLogout}
        />
      )}

      {/* Modals — fixed fullscreen above the menu (z-50). The inner components
          use `absolute inset-0` so wrapping them here gives them a proper
          positioned ancestor and the full viewport. */}
      {phase === 'menu' && (
        <>
          {showArmory && (
            <div className="fixed inset-0 z-[80] pointer-events-none">
              <div className="pointer-events-auto h-full w-full">
                <ArmoryScreen
                  profile={profile}
                  onClose={() => {
                    inputRef.current?.clear();
                    setArmory(false);
                  }}
                  onBuy={buySkin}
                  onEquip={equipSkin}
                  lang={lang}
                />
              </div>
            </div>
          )}

          {showAuth && (
            <div className="fixed inset-0 z-[80] pointer-events-none">
              <div className="pointer-events-auto h-full w-full">
                <AuthScreen
                  onClose={closeAuth}
                  onLogin={doLogin}
                  onRegister={doRegister}
                  lang={lang}
                  online={isOnline()}
                />
              </div>
            </div>
          )}

          {showGuide && (
            <div className="fixed inset-0 z-[70] pointer-events-none">
              <div className="pointer-events-auto h-full w-full">
                <GuideScreen
                  onClose={() => {
                    inputRef.current?.clear();
                    guideOpenRef.current = false;
                    setShowGuide(false);
                  }}
                  lang={lang}
                  isTouch={isTouch}
                />
              </div>
            </div>
          )}

          {showDaily && (
            <div className="fixed inset-0 z-[80] pointer-events-none">
              <div className="pointer-events-auto h-full w-full">
                <DailyScreen
                  state={daily}
                  onClose={closeDaily}
                  onClaim={claimDaily}
                  lang={lang}
                  gems={profile.gems || 0}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
