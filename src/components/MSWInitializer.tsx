'use client';

import { useEffect } from 'react';

export default function MSWInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as unknown as Record<string, boolean>).__MSW_STARTED__) return;

    void import('@/mocks/browser')
      .then(({ worker }) => {
        (window as unknown as Record<string, boolean>).__MSW_STARTED__ = true;
        return worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: { url: '/mockServiceWorker.js' },
        });
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('MSW failed to start', err);
        }
      });
  }, []);

  return null;
}
