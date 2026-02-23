'use client';

import { useEffect } from 'react';

import { logger } from '@giulio-leone/lib-shared';
const SW_PATH = '/sw.js';

export function PwaProvider() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let mounted = true;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });

        const onUpdateFound = () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.onstatechange = () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              logger.warn('[PWA] Nuova versione disponibile, ricarica per aggiornare');
            }
          };
        };

        registration.addEventListener('updatefound', onUpdateFound);

        if (registration.waiting) {
          logger.warn('[PWA] Aggiornamento pronto, ricarica per applicarlo');
        }
      } catch (error) {
        if (mounted) {
          logger.error('[PWA] Registrazione service worker fallita', error);
        }
      }
    };

    register();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
