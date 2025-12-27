import { useState, useCallback } from 'react';

/**
 * Hook per la ricerca voli via OneFlight
 */
export function useFlightSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  /**
   * Esegue la ricerca voli
   */
  const search = useCallback(async (input: any) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/flight/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Errore server: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.isError) {
        throw new Error(data.message || 'Errore durante la ricerca');
      }

      setResults(data);

      // Auto-save search to history (fire and forget)
      if (data && Array.isArray(data) && data.length > 0) {
        const lowestPrice = Math.min(...data.map((f: any) => f.price));
        const hasDeal = data.some((f: any) => f.isDeal);
        const dealSavings = hasDeal 
          ? Math.max(...data.filter((f: any) => f.isDeal).map((f: any) => f.savingsAmount || 0))
          : undefined;

        fetch('/api/flight/searches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flyFrom: input.flyFrom,
            flyTo: input.flyTo,
            departureDate: input.departureDate,
            returnDate: input.returnDate,
            tripType: input.returnDate ? 'round-trip' : 'one-way',
            passengers: input.passengers || 1,
            cabinClass: input.cabinClass || 'M',
            resultsCount: data.length,
            lowestPrice,
            hasDeal,
            dealSavings,
          }),
        }).catch(() => {}); // Ignore errors
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Errore imprevisto durante la ricerca');
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setIsSearching(false);
  }, []);

  return {
    isSearching,
    error,
    results,
    search,
    reset,
  };
}

