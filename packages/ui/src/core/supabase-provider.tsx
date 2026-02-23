'use client';

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { useSession } from 'next-auth/react';
import { useRealtimeStore } from '@giulio-leone/lib-stores';
import { getSupabaseToken } from '@/app/actions/supabase-token';
import { logger } from '@giulio-leone/lib-shared';

type SupabaseContextType = {
  supabase: SupabaseClientType<Database> | null;
  isRealtimeReady: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | null>(null);

/**
 * Lazily creates the Supabase client to avoid Turbopack HMR issues.
 * The @supabase/realtime-js package uses process.js polyfill which can
 * become unavailable during Turbopack module evaluation.
 */
function createSupabaseClient(): SupabaseClientType<Database> {
  // Dynamic require to defer loading until runtime

  const { createClient } = require('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.warn('Supabase credentials missing! Realtime features will be disabled.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }) as SupabaseClientType<Database>;
}

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isRealtimeReady, setIsRealtimeReady] = useState(false);

  // Lazy-initialized Supabase client to avoid Turbopack HMR polyfill issues
  const supabaseRef = useRef<SupabaseClientType<Database> | null>(null);

  // Initialize client lazily on first render (client-side only)
  if (!supabaseRef.current && typeof window !== 'undefined') {
    supabaseRef.current = createSupabaseClient();
  }

  // Zustand store actions (sono già stabili grazie alla memoizzazione di Zustand)
  const initializeRealtime = useRealtimeStore((state) => state.initialize);
  const resetRealtime = useRealtimeStore((state) => state.reset);

  // Ref per tracciare se il componente è ancora montato
  const isMountedRef = useRef(true);

  // Ref per tracciare se una richiesta è già in corso (evita chiamate duplicate)
  const isRequestInProgressRef = useRef(false);

  // Ref per tracciare se abbiamo già un token valido (evita richieste non necessarie)
  const hasValidTokenRef = useRef(false);

  // Ref per tracciare l'userId corrente (per resettare il flag quando l'utente cambia)
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    // Ensure client is initialized
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }

    const supabase = supabaseRef.current;

    const setRealtimeAuth = async () => {
      // Guard: evita chiamate quando lo status è ancora in loading
      if (status === 'loading') {
        return;
      }

      // Guard: verifica che la sessione sia autenticata e completa
      // Controlliamo esplicitamente session?.user?.id per evitare chiamate premature
      if (status === 'authenticated' && session?.user) {
        // Verifica che l'user abbia un id valido prima di procedere
        interface SessionUser {
          id?: string;
          sub?: string;
        }
        const userId = (session.user as SessionUser)?.id ?? (session.user as SessionUser)?.sub;
        if (!userId) {
          // Sessione non ancora completa, aspetta il prossimo render
          return;
        }

        // Se l'userId è cambiato, resetta il flag del token valido
        // (utile quando l'utente fa login con un account diverso)
        if (currentUserIdRef.current !== userId) {
          hasValidTokenRef.current = false;
          currentUserIdRef.current = userId;
        }

        // Evita chiamate duplicate se una richiesta è già in corso
        if (isRequestInProgressRef.current) {
          return;
        }

        // Se abbiamo già un token valido per questo utente, non richiediamo di nuovo
        // (utile per evitare chiamate durante re-render causati da Strict Mode)
        if (hasValidTokenRef.current) {
          return;
        }

        try {
          // Previeni sottoscrizioni con token vecchio/invalido
          setIsRealtimeReady(false);

          // Marca che una richiesta è in corso
          isRequestInProgressRef.current = true;

          // Chiama la Server Action invece di fetch (non appare nel network tab)
          const result = await getSupabaseToken();

          // Verifica se il componente è ancora montato dopo l'await
          if (!isMountedRef.current) {
            isRequestInProgressRef.current = false;
            return;
          }

          // Se la Server Action restituisce null, la sessione non è valida
          if (!result || !result.token) {
            // Non loggiamo errori qui per evitare spam quando la sessione non è ancora pronta
            isRequestInProgressRef.current = false;
            return;
          }

          const { token } = result;

          // Verifica ancora se il componente è montato
          if (!isMountedRef.current) {
            isRequestInProgressRef.current = false;
            return;
          }

          // Set the token for Realtime connection
          supabase.realtime.setAuth(token);

          // Inizializza lo store Realtime Zustand solo dopo aver ottenuto il token con successo
          initializeRealtime(supabase as SupabaseClientType);

          // Marca che abbiamo un token valido
          hasValidTokenRef.current = true;
          setIsRealtimeReady(true);
        } catch (error) {
          logger.error('[SupabaseProvider] Error setting Supabase auth:', error);
          if (isMountedRef.current) {
            setIsRealtimeReady(false);
            hasValidTokenRef.current = false;
          }
        } finally {
          // Reset del flag di richiesta in corso
          isRequestInProgressRef.current = false;
        }
      } else if (status === 'unauthenticated') {
        // Reset dello store Realtime al logout
        resetRealtime();
        // Disconnetti tutti i canali quando l'utente fa logout
        supabase.realtime.disconnect();
        // Reset dei flag
        hasValidTokenRef.current = false;
        isRequestInProgressRef.current = false;
        currentUserIdRef.current = null;
        // Consideriamo ready (come anonimo)
        setIsRealtimeReady(true);
      }
    };

    setRealtimeAuth();

    // Cleanup quando il componente si smonta
    return () => {
      isMountedRef.current = false;
      isRequestInProgressRef.current = false;
    };
  }, [session, status, initializeRealtime, resetRealtime]);

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseRef.current, isRealtimeReady }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  }
  return context;
}
