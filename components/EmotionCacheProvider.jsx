'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// ─── Emotion Cache Provider ─────────────────────────────────────────────────────
// Flushes emotion's server-rendered styles into the HTML stream via
// useServerInsertedHTML so the SSR markup matches the client. Without this, MUI's
// emotion styles are injected inline during SSR but not on the client, causing a
// hydration mismatch.

export default function EmotionCacheProvider({ children, options = { key: 'mui' } }) {
  const [registry] = useState(() => {
    const cache = createCache(options);
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = registry.flush();
    if (names.length === 0) return null;

    let styles = '';
    for (const name of names) {
      styles += registry.cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${registry.cache.key} ${names.join(' ')}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
