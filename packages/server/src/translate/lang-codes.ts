import { franc } from 'franc-min';

/**
 * ISO 639-1 → FLORES-200 mapping for NLLB translation.
 * Only convert at the NLLB API boundary; everywhere else we use ISO codes.
 */
const ISO_TO_FLORES: Record<string, string> = {
  // Existing languages (carried over from LibreTranslate)
  en: 'eng_Latn',
  es: 'spa_Latn',
  ru: 'rus_Cyrl',
  ar: 'arb_Arab',
  ga: 'gle_Latn',
  uk: 'ukr_Cyrl',
  zh: 'zho_Hans',
  hi: 'hin_Deva',
  ja: 'jpn_Jpan',
  ko: 'kor_Hang',
  vi: 'vie_Latn',
  fr: 'fra_Latn',
  pt: 'por_Latn',
  de: 'deu_Latn',
  tr: 'tur_Latn',
  th: 'tha_Thai',
  // African languages (new with NLLB)
  sw: 'swh_Latn',
  yo: 'yor_Latn',
  am: 'amh_Ethi',
  ha: 'hau_Latn',
  zu: 'zul_Latn',
  ig: 'ibo_Latn',
  xh: 'xho_Latn',
  wo: 'wol_Latn',
  so: 'som_Latn',
  rw: 'kin_Latn',
  sn: 'sna_Latn',
  lg: 'lug_Latn',
  ln: 'lin_Latn',
  ti: 'tir_Ethi',
};

const FLORES_TO_ISO: Record<string, string> = {};
for (const [iso, flores] of Object.entries(ISO_TO_FLORES)) {
  FLORES_TO_ISO[flores] = iso;
}

/**
 * franc returns ISO 639-3 (3-letter) codes. Map to our ISO 639-1 (2-letter) codes.
 */
const ISO3_TO_ISO1: Record<string, string> = {
  eng: 'en',
  spa: 'es',
  rus: 'ru',
  arb: 'ar',
  ara: 'ar',
  gle: 'ga',
  ukr: 'uk',
  zho: 'zh',
  cmn: 'zh',
  hin: 'hi',
  jpn: 'ja',
  kor: 'ko',
  vie: 'vi',
  fra: 'fr',
  por: 'pt',
  deu: 'de',
  tur: 'tr',
  tha: 'th',
  swh: 'sw',
  swa: 'sw',
  yor: 'yo',
  amh: 'am',
  hau: 'ha',
  zul: 'zu',
  ibo: 'ig',
  xho: 'xh',
  wol: 'wo',
  som: 'so',
  kin: 'rw',
  sna: 'sn',
  lug: 'lg',
  lin: 'ln',
  tir: 'ti',
};

export const SUPPORTED_ISO_CODES = Object.keys(ISO_TO_FLORES);

/** Languages only available via NLLB (no LibreTranslate support). */
export const NLLB_ONLY_CODES = new Set(['sw', 'ha']);

/** Languages available via LibreTranslate. */
export const LIBRE_CODES = new Set([
  'en',
  'es',
  'ru',
  'ar',
  'ga',
  'uk',
  'zh',
  'hi',
  'ja',
  'ko',
  'vi',
  'fr',
  'pt',
  'de',
  'tr',
  'th',
]);

export function isoToFlores(iso: string): string | undefined {
  return ISO_TO_FLORES[iso];
}

export function floresToIso(flores: string): string | undefined {
  return FLORES_TO_ISO[flores];
}

/**
 * Detect the source language of text using franc-min.
 * Returns an ISO 639-1 code. Falls back to 'en' for short or ambiguous text.
 */
export function detectLanguage(text: string): string {
  // Strip URLs — they confuse franc (e.g. ".com" → Portuguese)
  const stripped = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/www\.\S+/g, '')
    .trim();
  if (stripped.length < 20) return 'en';

  const iso3 = franc(stripped);
  if (iso3 === 'und') return 'en';

  return ISO3_TO_ISO1[iso3] ?? 'en';
}
