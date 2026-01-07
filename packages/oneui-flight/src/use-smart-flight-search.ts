'use client';

import { useState, useCallback } from 'react';
import type { 
  FlightAnalysis, 
  FlightRecommendation 
} from './smart-analysis-panel';
import type { Flight } from './flight-card';

// ==================== TYPES ====================

export interface SmartSearchInput {
  flyFrom: string[];
  flyTo: string[];
  departureDate: string;
  returnDate?: string | null;
  maxResults?: number;
  currency?: string;
  preferences?: {
    priority?: 'price' | 'duration' | 'convenience';
    preferDirectFlights?: boolean;
    maxLayoverHours?: number;
    departureTimePreference?: 'morning' | 'afternoon' | 'evening' | 'any';
  };
}

export interface SmartSearchResult {
  tripType: 'one-way' | 'round-trip';
  outbound: Flight[];
  return?: Flight[];
  analysis: FlightAnalysis;
  recommendation: FlightRecommendation;
  alternatives?: FlightRecommendation[];
  metadata: {
    searchedAt: string;
    totalResults: number;
    cheapestPrice?: number;
    searchDurationMs?: number;
    agentVersion?: string;
  };
}

export interface SmartSearchState {
  isSearching: boolean;
  results: SmartSearchResult | null;
  error: string | null;
}

// ==================== HOOK ====================

/**
 * Hook for AI-powered smart flight search
 * 
 * Uses the OneAgent SDK backend for intelligent analysis and recommendations.
 */
export function useSmartFlightSearch() {
  const [state, setState] = useState<SmartSearchState>({
    isSearching: false,
    results: null,
    error: null,
  });

  const search = useCallback(async (input: SmartSearchInput) => {
    setState({ isSearching: true, results: null, error: null });

    try {
      // Convert date format from dd/mm/yyyy to yyyy-mm-dd
      const convertDate = (dateStr: string): string => {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return dateStr;
        const [day, month, year] = parts;
        return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
      };

      const response = await fetch('/api/flight/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flyFrom: input.flyFrom,
          flyTo: input.flyTo,
          departureDate: convertDate(input.departureDate),
          returnDate: input.returnDate ? convertDate(input.returnDate) : undefined,
          maxResults: input.maxResults ?? 5,
          currency: input.currency ?? 'EUR',
          preferences: input.preferences ?? {
            priority: 'price',
            preferDirectFlights: true,
            maxLayoverHours: 4,
            departureTimePreference: 'any',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      // Map the response to our expected format
      const results: SmartSearchResult = {
        tripType: data.tripType,
        outbound: data.outbound || [],
        return: data.return,
        analysis: data.analysis,
        recommendation: data.recommendation,
        alternatives: data.alternatives,
        metadata: data.metadata,
      };

      setState({ isSearching: false, results, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setState({ isSearching: false, results: null, error: message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isSearching: false, results: null, error: null });
  }, []);

  return {
    ...state,
    search,
    reset,
  };
}

export default useSmartFlightSearch;
