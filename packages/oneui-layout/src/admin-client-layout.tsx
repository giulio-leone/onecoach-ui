'use client';

/**
 * Admin Client Layout
 *
 * Client component che wrappa il layout admin per abilitare
 * funzionalità client-side come Realtime sync.
 *
 * Nota: in ambienti dove il QueryClientProvider non è già presente
 * (es. mount isolati o test), facciamo fallback a QueryProvider per
 * evitare l'errore "No QueryClient set".
 */

import { useContext } from 'react';
import { QueryClientContext } from '@tanstack/react-query';
import { QueryProvider } from '@onecoach/lib-api/react-query';
import { AdminRealtimeProvider } from '@/components/providers/realtime-provider';

interface AdminClientLayoutProps {
  children: React.ReactNode;
}

export function AdminClientLayout({
  children }: AdminClientLayoutProps) {
  const queryClient = useContext(QueryClientContext);
  const content = <AdminRealtimeProvider>{children}</AdminRealtimeProvider>;

  // Se il contesto esiste, usiamo il provider già montato (root layout)
  if (queryClient) {
    return content;
  }

  // Fallback per mount isolati senza QueryClientProvider
  return <QueryProvider>{content}</QueryProvider>;
}
