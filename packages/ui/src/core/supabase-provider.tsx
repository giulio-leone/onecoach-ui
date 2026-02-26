'use client';

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import { useRealtimeStore } from '@giulio-leone/lib-stores';
import { logger } from '@giulio-leone/lib-shared';

export type SupabaseContextType = {
  supabase: SupabaseClientType | null;
  isRealtimeReady: boolean;
};

/** Injected token fetcher — provided by the consuming app */
export type GetSupabaseToken = () => Promise<{ token: string } | null>;

const SupabaseContext = createContext<SupabaseContextType | null>(null);

/**
 * Lazily creates the Supabase client to avoid Turbopack HMR issues.
 */
function createSupabaseClient(): SupabaseClientType {
  const { createClient } = require('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.warn('Supabase credentials missing! Realtime features will be disabled.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { params: { eventsPerSecond: 10 } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) as SupabaseClientType;
}

interface SupabaseProviderProps {
  children: ReactNode;
  /** Injected server action to fetch the Supabase auth token (hexagonal DI) */
  getToken: GetSupabaseToken;
}

export function SupabaseProvider({ children, getToken }: SupabaseProviderProps): ReactNode {
  const { data: session, status } = useSession();
  const [isRealtimeReady, setIsRealtimeReady] = useState(false);

  const supabaseRef = useRef<SupabaseClientType | null>(null);

  if (!supabaseRef.current && typeof window !== 'undefined') {
    supabaseRef.current = createSupabaseClient();
  }

  const initializeRealtime = useRealtimeStore((state) => state.initialize);
  const resetRealtime = useRealtimeStore((state) => state.reset);

  const isMountedRef = useRef(true);
  const isRequestInProgressRef = useRef(false);
  const hasValidTokenRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }

    const supabase = supabaseRef.current;

    const setRealtimeAuth = async (): Promise<void> => {
      if (status === 'loading') return;

      if (status === 'authenticated' && session?.user) {
        interface SessionUser { id?: string; sub?: string }
        const userId = (session.user as SessionUser)?.id ?? (session.user as SessionUser)?.sub;
        if (!userId) return;

        if (currentUserIdRef.current !== userId) {
          hasValidTokenRef.current = false;
          currentUserIdRef.current = userId;
        }

        if (isRequestInProgressRef.current || hasValidTokenRef.current) return;

        try {
          setIsRealtimeReady(false);
          isRequestInProgressRef.current = true;

          const result = await getToken();

          if (!isMountedRef.current) { isRequestInProgressRef.current = false; return; }
          if (!result?.token) { isRequestInProgressRef.current = false; return; }

          supabase.realtime.setAuth(result.token);
          initializeRealtime(supabase as SupabaseClientType);
          hasValidTokenRef.current = true;
          setIsRealtimeReady(true);
        } catch (error) {
          logger.error('[SupabaseProvider] Error setting Supabase auth:', error);
          if (isMountedRef.current) { setIsRealtimeReady(false); hasValidTokenRef.current = false; }
        } finally {
          isRequestInProgressRef.current = false;
        }
      } else if (status === 'unauthenticated') {
        resetRealtime();
        supabase.realtime.disconnect();
        hasValidTokenRef.current = false;
        isRequestInProgressRef.current = false;
        currentUserIdRef.current = null;
        setIsRealtimeReady(true);
      }
    };

    setRealtimeAuth();
    return () => { isMountedRef.current = false; isRequestInProgressRef.current = false; };
  }, [session, status, initializeRealtime, resetRealtime, getToken]);

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseRef.current, isRealtimeReady }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext(): SupabaseContextType {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  }
  return context;
}
