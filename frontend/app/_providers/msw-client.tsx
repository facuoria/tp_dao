'use client';

import { useEffect, useState } from 'react';

export default function MSWClientProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks/browser')
        .then(async ({ worker }) => {
          await worker.start({
            // 👇 fuerza la ruta correcta del SW en Next dev
            serviceWorker: { url: '/mockServiceWorker.js' },
            onUnhandledRequest: 'bypass',
          });
          console.info('[MSW] Mocking enabled');
          setReady(true);
        })
        .catch((e) => {
          console.error('[MSW] Failed to start', e);
          setReady(true); // no bloquees la app
        });
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
