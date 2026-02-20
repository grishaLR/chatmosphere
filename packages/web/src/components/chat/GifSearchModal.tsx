import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { searchGifs, type GifResult, type GifCapabilities, type GifSource } from '../../lib/api';
import styles from './GifSearchModal.module.css';

interface GifSearchModalProps {
  initialQuery: string;
  initialSource?: GifSource;
  capabilities: GifCapabilities;
  onSelect: (gif: GifResult, altText: string) => void;
  onClose: () => void;
}

export function GifSearchModal({
  initialQuery,
  initialSource,
  capabilities,
  onSelect,
  onClose,
}: GifSearchModalProps) {
  const { t } = useTranslation('chat');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<GifSource>(
    initialSource ?? (capabilities.giphy ? 'giphy' : 'klipy'),
  );
  const [selected, setSelected] = useState<GifResult | null>(null);
  const [altText, setAltText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hasBothSources = capabilities.giphy && capabilities.klipy;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    el.showModal();
  }, []);

  const handleClose = useCallback(() => {
    previousActiveRef.current?.focus();
    onClose();
  }, [onClose]);

  const doSearch = useCallback((q: string, src: GifSource) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = q.trim();
    if (!trimmed) {
      setGifs([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const ac = new AbortController();
      setLoading(true);
      searchGifs(src, trimmed, { limit: 24, signal: ac.signal })
        .then((results) => {
          setGifs(results);
        })
        .catch(() => {
          // ignore abort / network errors
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, []);

  // Search on mount
  useEffect(() => {
    if (initialQuery.trim()) {
      doSearch(initialQuery, source);
    }
  }, [initialQuery, source, doSearch]);

  function handleQueryChange(value: string) {
    setQuery(value);
    doSearch(value, source);
  }

  function handleSourceChange(newSource: GifSource) {
    setSource(newSource);
    setGifs([]);
    if (query.trim()) {
      doSearch(query, newSource);
    }
  }

  function handleGifClick(gif: GifResult) {
    setSelected(gif);
    setAltText(gif.title || '');
  }

  function handleConfirm() {
    if (!selected) return;
    onSelect(selected, altText.trim());
    dialogRef.current?.close();
  }

  function handleBack() {
    setSelected(null);
    setAltText('');
  }

  const attribution = source === 'klipy' ? t('gif.poweredByKlipy') : t('gif.poweredByGiphy');

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={handleClose}>
      <div className={styles.content}>
        <h2 className={styles.title}>{t('gif.title', 'GIFs')}</h2>

        {selected ? (
          <div className={styles.confirmPanel}>
            <img
              // eslint-disable-next-line no-restricted-syntax -- URL from server-proxied GIF API
              src={selected.previewUrl}
              alt={selected.title}
              className={styles.confirmGif}
              loading="lazy"
            />
            <textarea
              className={styles.altInput}
              value={altText}
              onChange={(e) => {
                setAltText(e.target.value);
              }}
              placeholder={t('gif.altTextPlaceholder')}
              rows={2}
            />
            <div className={styles.confirmActions}>
              <button type="button" className={styles.closeButton} onClick={handleBack}>
                {t('gif.back')}
              </button>
              <button type="button" className={styles.sendButton} onClick={handleConfirm}>
                {t('gif.confirm')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {hasBothSources && (
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${source === 'giphy' ? styles.tabActive : ''}`}
                  onClick={() => {
                    handleSourceChange('giphy');
                  }}
                >
                  Giphy
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${source === 'klipy' ? styles.tabActive : ''}`}
                  onClick={() => {
                    handleSourceChange('klipy');
                  }}
                >
                  Klipy
                </button>
              </div>
            )}

            <input
              className={styles.input}
              type="text"
              value={query}
              onChange={(e) => {
                handleQueryChange(e.target.value);
              }}
              placeholder={t('gif.searchPlaceholder')}
              autoFocus
            />

            <div className={styles.grid}>
              {loading && gifs.length === 0 && <p className={styles.status}>{t('gif.loading')}</p>}
              {!loading && query.trim() && gifs.length === 0 && (
                <p className={styles.status}>{t('gif.noResults')}</p>
              )}
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  className={styles.gifButton}
                  onClick={() => {
                    handleGifClick(gif);
                  }}
                  title={gif.title}
                >
                  <img
                    // eslint-disable-next-line no-restricted-syntax -- URL from server-proxied GIF API
                    src={gif.previewUrl}
                    alt={gif.title}
                    width={gif.previewWidth}
                    height={gif.previewHeight}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            <div className={styles.footer}>
              <span className={styles.poweredBy}>{attribution}</span>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  dialogRef.current?.close();
                }}
              >
                {t('gif.close')}
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
