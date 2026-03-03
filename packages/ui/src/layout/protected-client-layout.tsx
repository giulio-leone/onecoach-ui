'use client';

/**
 * Protected Client Layout
 *
 * Client component che wrappa il layout protetto per abilitare
 * funzionalità client-side come Realtime sync, Supabase context e Copilot context.
 *
 * Nota: in ambienti dove il QueryClientProvider non è già presente
 * (es. mount isolati o SSR), facciamo fallback a QueryProvider per
 * evitare l'errore "No QueryClient set".
 */

import { useContext } from 'react';
import { QueryClientContext } from '@tanstack/react-query';
import { QueryProvider } from '@giulio-leone/lib-api/react-query';
import { RealtimeProvider, SupabaseProvider } from '../core';

interface ProtectedClientLayoutProps {
  children: React.ReactNode;
}

export function ProtectedClientLayout({ children }: ProtectedClientLayoutProps) {
  const queryClient = useContext(QueryClientContext);
  const content = (
    <SupabaseProvider>
      <RealtimeProvider mode="full">{children}</RealtimeProvider>
    </SupabaseProvider>
  );

  // Se il contesto esiste, usiamo il provider già montato (root layout)
  if (queryClient) {
    return content;
  }

  // Fallback per mount isolati senza QueryClientProvider
  return <QueryProvider client={undefined}>{content}</QueryProvider>;
}
