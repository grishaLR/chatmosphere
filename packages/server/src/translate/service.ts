import { createHash } from 'crypto';
import { createLogger } from '../logger.js';
import { getCachedTranslations, insertTranslations } from './queries.js';
import {
  detectLanguage,
  floresToIso,
  isoToFlores,
  NLLB_ONLY_CODES,
  LIBRE_CODES,
} from './lang-codes.js';
import type { Sql } from '../db/client.js';

const log = createLogger('translate');

export function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

interface TranslationResult {
  text: string;
  translated: string;
  sourceLang: string;
}

interface UncachedItem {
  text: string;
  hash: string;
}

interface CheckCacheResult {
  cached: Map<string, TranslationResult>;
  uncached: UncachedItem[];
  hashMap: Map<string, string>;
}

export interface TranslateService {
  checkCache(texts: string[], targetLang: string): Promise<CheckCacheResult>;
  translateUncached(
    uncached: UncachedItem[],
    targetLang: string,
  ): Promise<Map<string, TranslationResult>>;
  isAvailable(): Promise<boolean>;
}

interface NllbTranslateResponse {
  translation: string[];
}

interface TranslateServiceConfig {
  sql: Sql;
  libreTranslateUrl?: string;
  nllbUrl?: string;
}

/**
 * Returns the list of supported ISO language codes based on which backends are configured.
 * - LibreTranslate configured → LIBRE_CODES
 * - NLLB configured → NLLB_ONLY_CODES (and LIBRE_CODES too if no LibreTranslate)
 * - Both → union of both sets
 */
export function getSupportedLanguages(libreUrl?: string, nllbUrl?: string): string[] {
  const codes = new Set<string>();

  if (libreUrl) {
    for (const c of LIBRE_CODES) codes.add(c);
  }

  if (nllbUrl) {
    for (const c of NLLB_ONLY_CODES) codes.add(c);
    // If no LibreTranslate, NLLB handles everything it knows
    if (!libreUrl) {
      for (const c of LIBRE_CODES) codes.add(c);
    }
  }

  return [...codes];
}

export function createTranslateService(config: TranslateServiceConfig): TranslateService {
  const { sql, libreTranslateUrl: libreUrl, nllbUrl } = config;

  /** Sequential POSTs with source:"auto" — LibreTranslate handles detection. */
  async function translateViaLibre(
    uncached: UncachedItem[],
    targetLang: string,
  ): Promise<{
    results: Map<string, TranslationResult>;
    toInsert: Array<{
      textHash: string;
      targetLang: string;
      sourceLang: string;
      translated: string;
    }>;
  }> {
    const results = new Map<string, TranslationResult>();
    const toInsert: Array<{
      textHash: string;
      targetLang: string;
      sourceLang: string;
      translated: string;
    }> = [];

    for (const item of uncached) {
      try {
        const res = await fetch(`${libreUrl}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: item.text,
            source: 'auto',
            target: targetLang,
          }),
          signal: AbortSignal.timeout(15_000),
        });

        if (!res.ok) {
          log.warn(
            { status: res.status, hash: item.hash },
            'LibreTranslate error, returning original',
          );
          results.set(item.hash, {
            text: item.text,
            translated: item.text,
            sourceLang: 'unknown',
          });
          continue;
        }

        const data = (await res.json()) as {
          translatedText: string;
          detectedLanguage?: { language: string };
        };

        const sourceLang = data.detectedLanguage?.language ?? 'unknown';
        results.set(item.hash, {
          text: item.text,
          translated: data.translatedText,
          sourceLang,
        });

        // Only cache when language was properly detected
        if (sourceLang !== 'unknown') {
          toInsert.push({
            textHash: item.hash,
            targetLang,
            sourceLang,
            translated: data.translatedText,
          });
        }
      } catch (err) {
        log.warn({ err, hash: item.hash }, 'LibreTranslate request failed, returning original');
        results.set(item.hash, {
          text: item.text,
          translated: item.text,
          sourceLang: 'unknown',
        });
      }
    }

    return { results, toInsert };
  }

  /** Batch POST with franc-min language detection — groups by source language. */
  async function translateViaNllb(
    uncached: UncachedItem[],
    targetLang: string,
  ): Promise<{
    results: Map<string, TranslationResult>;
    toInsert: Array<{
      textHash: string;
      targetLang: string;
      sourceLang: string;
      translated: string;
    }>;
  }> {
    const results = new Map<string, TranslationResult>();
    const toInsert: Array<{
      textHash: string;
      targetLang: string;
      sourceLang: string;
      translated: string;
    }> = [];

    const targetFlores = isoToFlores(targetLang);
    if (!targetFlores) {
      log.warn({ targetLang }, 'Unsupported target language for NLLB');
      for (const item of uncached) {
        results.set(item.hash, { text: item.text, translated: item.text, sourceLang: 'unknown' });
      }
      return { results, toInsert };
    }

    // Detect source language and group by FLORES code
    const groups = new Map<string, UncachedItem[]>();
    for (const item of uncached) {
      const sourceLang = detectLanguage(item.text);

      if (sourceLang === targetLang) {
        results.set(item.hash, { text: item.text, translated: item.text, sourceLang });
        continue;
      }

      const sourceFlores = isoToFlores(sourceLang);
      const key = sourceFlores ?? (isoToFlores('en') as string);
      let group = groups.get(key);
      if (!group) {
        group = [];
        groups.set(key, group);
      }
      group.push(item);
    }

    // One batch POST per source language group
    for (const [srcFlores, items] of groups) {
      const texts = items.map((e) => e.text);
      const timeout = Math.max(15_000, texts.length * 1500);

      try {
        const res = await fetch(`${nllbUrl}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: texts,
            src_lang: srcFlores,
            tgt_lang: targetFlores,
          }),
          signal: AbortSignal.timeout(timeout),
        });

        if (!res.ok) {
          log.warn(
            { status: res.status, srcFlores, count: texts.length },
            'NLLB batch error, returning originals',
          );
          for (const entry of items) {
            results.set(entry.hash, {
              text: entry.text,
              translated: entry.text,
              sourceLang: 'unknown',
            });
          }
          continue;
        }

        const data = (await res.json()) as NllbTranslateResponse;
        const srcIso = floresToIso(srcFlores) ?? 'unknown';

        for (let j = 0; j < items.length; j++) {
          const entry = items[j] as UncachedItem;
          const translated = data.translation[j] ?? entry.text;

          results.set(entry.hash, { text: entry.text, translated, sourceLang: srcIso });
          toInsert.push({ textHash: entry.hash, targetLang, sourceLang: srcIso, translated });
        }
      } catch (err) {
        log.warn(
          { err, srcFlores, count: texts.length },
          'NLLB batch request failed, returning originals',
        );
        for (const entry of items) {
          results.set(entry.hash, {
            text: entry.text,
            translated: entry.text,
            sourceLang: 'unknown',
          });
        }
      }
    }

    return { results, toInsert };
  }

  return {
    async checkCache(texts: string[], targetLang: string): Promise<CheckCacheResult> {
      const hashMap = new Map<string, string>();
      const seen = new Set<string>();
      const uniqueHashes: string[] = [];

      for (const text of texts) {
        const h = hashText(text);
        hashMap.set(text, h);
        if (!seen.has(h)) {
          seen.add(h);
          uniqueHashes.push(h);
        }
      }

      const rows = await getCachedTranslations(sql, uniqueHashes, targetLang);
      const cached = new Map<string, TranslationResult>();
      const cachedHashes = new Set<string>();

      for (const row of rows) {
        cachedHashes.add(row.textHash);
        cached.set(row.textHash, {
          text: '', // original text filled by router
          translated: row.translated,
          sourceLang: row.sourceLang,
        });
      }

      const uncached: UncachedItem[] = [];
      const uncachedSeen = new Set<string>();
      for (const text of texts) {
        const h = hashMap.get(text) ?? hashText(text);
        if (!cachedHashes.has(h) && !uncachedSeen.has(h)) {
          uncachedSeen.add(h);
          uncached.push({ text, hash: h });
        }
      }

      return { cached, uncached, hashMap };
    },

    async translateUncached(
      uncached: UncachedItem[],
      targetLang: string,
    ): Promise<Map<string, TranslationResult>> {
      // Route to the correct backend
      const useNllb = NLLB_ONLY_CODES.has(targetLang) || (!libreUrl && nllbUrl);
      const useLibre = !NLLB_ONLY_CODES.has(targetLang) && libreUrl;

      let translated: {
        results: Map<string, TranslationResult>;
        toInsert: Array<{
          textHash: string;
          targetLang: string;
          sourceLang: string;
          translated: string;
        }>;
      };

      if (useNllb && nllbUrl) {
        translated = await translateViaNllb(uncached, targetLang);
      } else if (useLibre) {
        translated = await translateViaLibre(uncached, targetLang);
      } else {
        // No backend available for this language — return originals
        const results = new Map<string, TranslationResult>();
        for (const item of uncached) {
          results.set(item.hash, {
            text: item.text,
            translated: item.text,
            sourceLang: 'unknown',
          });
        }
        return results;
      }

      // Batch-insert new translations into shared cache
      if (translated.toInsert.length > 0) {
        try {
          await insertTranslations(sql, translated.toInsert);
        } catch (err) {
          log.error({ err }, 'Failed to insert translations into cache');
        }
      }

      return translated.results;
    },

    async isAvailable(): Promise<boolean> {
      const checks: Promise<boolean>[] = [];

      if (libreUrl) {
        checks.push(
          fetch(`${libreUrl}/languages`, { signal: AbortSignal.timeout(3000) })
            .then((r) => r.ok)
            .catch(() => false),
        );
      }

      if (nllbUrl) {
        checks.push(
          fetch(`${nllbUrl}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: ['hello'],
              src_lang: 'eng_Latn',
              tgt_lang: 'spa_Latn',
            }),
            signal: AbortSignal.timeout(5000),
          })
            .then((r) => r.ok)
            .catch(() => false),
        );
      }

      if (checks.length === 0) return false;
      const results = await Promise.all(checks);
      return results.some(Boolean);
    },
  };
}
