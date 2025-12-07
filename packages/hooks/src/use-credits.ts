/**
 * useCredits Hook
 *
 * Custom hook per gestione crediti
 */

import { useState, useEffect, useCallback } from 'react';

interface CreditStats {
  balance: number;
  hasUnlimitedCredits: boolean;
  totalConsumed: number;
  totalAdded: number;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export function useCredits() {
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/credits/balance');
      if (!response.ok) {
        throw new Error('Failed to fetch credit stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch credit stats:', err);
    }
  }, []);

  const fetchHistory = useCallback(async (limit = 50) => {
    try {
      const response = await fetch(`/api/credits/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credit history');
      }
      const data = await response.json();
      setHistory(data.transactions || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch credit history:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchHistory()]);
    setIsLoading(false);
  }, [fetchStats, fetchHistory]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    history,
    isLoading,
    error,
    refresh,
  };
}
