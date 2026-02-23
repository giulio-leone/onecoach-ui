'use client';

/**
 * Realtime Provider
 *
 * Client component che integra Realtime sync per l'intera app.
 * Da usare nei layout per abilitare sync automatico su tutte le pagine.
 *
 * Each mode renders a different inner component to respect React hooks rules.
 */

// import {
//   useAppRealtime,
//   useDashboardRealtime,
//   useAdminRealtime,
//   useAdminAIRealtime,
// } from '@giulio-leone/hooks';

interface RealtimeProviderProps {
  children: React.ReactNode;
  /**
   * Modalità di sincronizzazione:
   * - 'full': Sincronizza tutti i domini (per layout principale)
   * - 'dashboard': Solo metriche dashboard
   * - 'admin': Tutti i domini per admin panel
   */
  mode?: 'full' | 'dashboard' | 'admin';
}

// Separate components to respect rules-of-hooks (no conditional hook calls)
function AppRealtimeInner({ children }: { children: React.ReactNode }) {
  // useAppRealtime();
  return <>{children}</>;
}

function DashboardRealtimeInner({ children }: { children: React.ReactNode }) {
  // useDashboardRealtime();
  return <>{children}</>;
}

function AdminRealtimeInner({ children }: { children: React.ReactNode }) {
  // useAdminRealtime();
  // useAdminAIRealtime();
  return <>{children}</>;
}

export function RealtimeProvider({ children, mode = 'full' }: RealtimeProviderProps) {
  // Render different component based on mode - this is safe as mode shouldn't change
  switch (mode) {
    case 'admin':
      return <AdminRealtimeInner>{children}</AdminRealtimeInner>;
    case 'dashboard':
      return <DashboardRealtimeInner>{children}</DashboardRealtimeInner>;
    default:
      return <AppRealtimeInner>{children}</AppRealtimeInner>;
  }
}

/**
 * Admin Realtime Provider
 *
 * Versione specifica per admin che include sync per:
 * - Esercizi
 * - Food items
 * - Coach profiles
 * - Utenti
 */
export function AdminRealtimeProvider({ children }: { children: React.ReactNode }) {
  // useAdminRealtime();

  return <>{children}</>;
}

export default RealtimeProvider;
