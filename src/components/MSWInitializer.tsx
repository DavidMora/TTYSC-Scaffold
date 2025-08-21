'use client';

import { useEffect } from 'react';

export default function MSWInitializer() {
  useEffect(() => {
    // Dynamic import to avoid bundling in prod
    import('@/mocks/browser').then(({ worker }) => {
      worker.start({ onUnhandledRequest: 'bypass' });
    });
  }, []);

  return null;
}
