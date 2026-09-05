/**
 * LEXICON MODE dictionary.
 *
 * Every entry is a REAL word, hand-verified and typed at its exact written
 * length. Persian short vowels are not written, so "نان" is 3 letters,
 * "کتاب" is 4 and "ستاره" is 5.
 *
 * No truncation or slicing is used anywhere — a sliced word is a fake word.
 */

export type WordLen = 3 | 4 | 5;

export const WORDS_EN: Record<WordLen, string[]> = {
  3: [
    'ARC', 'AXE', 'BOW', 'CUT', 'DAY', 'DIM', 'FOG', 'GEM', 'HIT', 'ICE',
    'JAB', 'KEY', 'LAW', 'MAP', 'NET', 'OAK', 'PIT', 'RAY', 'SKY', 'TAG',
    'WAR', 'ZAP', 'AIR', 'BAT', 'CAP', 'DEN', 'ELM', 'FIN', 'GAP', 'HUB',
    'ION', 'JET', 'KIN', 'LOG', 'MUD', 'NOD', 'ORB', 'PAW', 'RIB', 'SUN',
    'TIP', 'VAN', 'WEB', 'YAK', 'ZIP', 'BUD', 'COW', 'DOT', 'EAR', 'FAN',
  ],
  4: [
    'BOLT', 'CALM', 'DARK', 'DUSK', 'ECHO', 'FIRE', 'GLOW', 'HAWK', 'IRON', 'JADE',
    'KEEN', 'LAVA', 'MIST', 'NOVA', 'OATH', 'PACT', 'QUIT', 'RUNE', 'STAR', 'TIDE',
    'VEIL', 'WAVE', 'YARN', 'ZONE', 'ARCH', 'BEAM', 'CORE', 'DAWN', 'FANG', 'GALE',
    'HALO', 'ISLE', 'KILN', 'LOOM', 'MOSS', 'NEON', 'ONYX', 'PEAK', 'RAIN', 'SALT',
    'TREE', 'VASE', 'WOLF', 'YARD', 'BLUE', 'CAVE', 'DOOR', 'EDGE', 'FROG', 'GOLD',
  ],
  5: [
    'ARROW', 'BLAZE', 'CHARM', 'DRIFT', 'EMBER', 'FLARE', 'GLYPH', 'HAVEN', 'INGOT', 'JOUST',
    'KNIFE', 'LANCE', 'MERGE', 'NOBLE', 'ORBIT', 'PRISM', 'QUEST', 'RIDGE', 'STORM', 'TITAN',
    'ULTRA', 'VAPOR', 'WRATH', 'YIELD', 'AMBER', 'BRISK', 'CROWN', 'DELTA', 'EAGLE', 'FROST',
    'GHOST', 'HONOR', 'IVORY', 'LUNAR', 'MAGMA', 'NIGHT', 'OCEAN', 'PLUME', 'QUARK', 'RIVER',
    'SHARD', 'TOWER', 'VIVID', 'WHALE', 'BEACH', 'CLOUD', 'DREAM', 'FLAME', 'GRAPE', 'HEART',
  ],
};

export const WORDS_FA: Record<WordLen, string[]> = {
  // 3 written letters
  3: [
    'نان', 'سیب', 'ماه', 'روز', 'باد', 'برف', 'گرم', 'سرد', 'راه', 'کوه',
    'شیر', 'اسب', 'مرد', 'درس', 'قلم', 'گوش', 'چشم', 'دست', 'پول', 'کار',
    'نور', 'سنگ', 'خون', 'درد', 'پدر', 'شهر', 'خاک', 'ابر', 'صدا', 'رنگ',
    'سبز', 'زرد', 'آبی', 'خوب', 'شاد', 'گاو', 'برگ', 'میز', 'جان', 'یاد',
    'دیر', 'زود', 'تیز', 'نرم', 'پاک', 'گرد', 'سیر', 'مهر', 'موز', 'دیو',
  ],
  // 4 written letters
  4: [
    'کتاب', 'خانه', 'مادر', 'دوست', 'دریا', 'درخت', 'گربه', 'کلاس', 'معلم', 'کلید',
    'میوه', 'چراغ', 'گیاه', 'جنگل', 'سفید', 'سیاه', 'قرمز', 'بزرگ', 'کوچک', 'بلند',
    'زیبا', 'دانش', 'کشور', 'جهان', 'فردا', 'شادی', 'آواز', 'بهار', 'زمین', 'پرچم',
    'پیام', 'تلاش', 'جواب', 'حساب', 'خیال', 'زبان', 'سلام', 'شکار', 'نامه', 'ساعت',
    'قایق', 'پنیر', 'شانه', 'لباس', 'اتاق', 'برنج', 'مداد', 'دفتر', 'آینه', 'ماهی',
  ],
  // 5 written letters
  5: [
    'ستاره', 'آسمان', 'پرنده', 'مدرسه', 'انگور', 'پنجره', 'باران', 'برادر', 'خواهر', 'کوتاه',
    'غمگین', 'ایران', 'تهران', 'زندگی', 'امروز', 'دیروز', 'شیرین', 'بلندی', 'دلاور', 'سرباز',
    'فرشته', 'همیشه', 'کارگر', 'آرامش', 'بازار', 'پزشکی', 'تصویر', 'روشنی', 'سپیده', 'شکوفه',
    'گلابی', 'کبوتر', 'خرگوش', 'شترها', 'مرغان', 'دریچه', 'بشقاب', 'نقاشی', 'ورزشی', 'تمرین',
    'مسافر', 'پرواز', 'شمشیر', 'گنجشک', 'گلدان', 'چشمها', 'دستها', 'آبشار', 'پیروز', 'جنگجو',
  ],
};

/** Persian letters used to seed decoy pickups. */
export const FA_ALPHABET = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('');
export const EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Keep only entries that are genuinely the requested length and unique.
 * Anything that doesn't match exactly is dropped rather than truncated.
 */
function clean(list: string[], len: number) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const w of list) {
    const t = (w || '').trim();
    if (!t || t.length !== len || seen.has(t)) continue;
    // reject anything with non-letter characters (ZWNJ, digits, punctuation)
    if (/[\s\u200c0-9]/.test(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function wordPool(lang: 'en' | 'fa', len: WordLen): string[] {
  const src = lang === 'fa' ? WORDS_FA[len] : WORDS_EN[len];
  const pool = clean(src, len);
  // never hand back an empty pool — fall back to English so the mode can't crash
  return pool.length ? pool : clean(WORDS_EN[len], len);
}

export function alphabetFor(lang: 'en' | 'fa') {
  return lang === 'fa' ? FA_ALPHABET : EN_ALPHABET;
}
