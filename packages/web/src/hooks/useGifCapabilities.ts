import { useState, useEffect } from 'react';
import { fetchGifCapabilities, type GifCapabilities } from '../lib/api';

let cachedCapabilities: GifCapabilities | null = null;

export function useGifCapabilities() {
  const [capabilities, setCapabilities] = useState<GifCapabilities>(
    cachedCapabilities ?? { giphy: false, klipy: false },
  );

  useEffect(() => {
    if (cachedCapabilities) return;

    let cancelled = false;
    void fetchGifCapabilities().then((caps) => {
      if (cancelled) return;
      cachedCapabilities = caps;
      setCapabilities(caps);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasAnyGifService = capabilities.giphy || capabilities.klipy;

  return { capabilities, hasAnyGifService };
}
