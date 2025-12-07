/**
 * useReferralTracking Hook - Cross-platform
 *
 * Hook per gestire il tracciamento dei referral code
 * attraverso la navigazione e il checkout
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'app/navigation';

interface ReferralTrackingState {
  referralCode: string | null;
  isValid: boolean;
  isChecking: boolean;
  error: string | null;
}

export function useReferralTracking() {
  const [state, setState] = useState<ReferralTrackingState>({
    referralCode: null,
    isValid: false,
    isChecking: false,
    error: null,
  });

  const router = useRouter();
  const validationInProgressRef = useRef(false);

  const validateReferralCode = useCallback(async (code: string) => {
    if (validationInProgressRef.current) return;

    validationInProgressRef.current = true;
    setState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const response = await fetch('/api/affiliates/validate-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          isValid: false,
          error: data.error || 'Codice referral non valido',
          isChecking: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isValid: data.valid,
        error: data.valid ? null : 'Codice referral non valido',
        isChecking: false,
      }));
    } catch (_error: unknown) {
      setState((prev) => ({
        ...prev,
        isValid: false,
        error: 'Errore nella validazione del codice',
        isChecking: false,
      }));
    } finally {
      validationInProgressRef.current = false;
    }
  }, []);

  const setReferralCode = useCallback(
    (code: string) => {
      const normalizedCode = code.trim().toUpperCase();
      setState((prev) => ({
        ...prev,
        referralCode: normalizedCode || null,
        isValid: false,
        error: null,
      }));

      if (normalizedCode) {
        validateReferralCode(normalizedCode);
      }
    },
    [validateReferralCode]
  );

  const clearReferralCode = useCallback(() => {
    setState({
      referralCode: null,
      isValid: false,
      isChecking: false,
      error: null,
    });
  }, []);

  const addToUrl = useCallback(
    (code: string) => {
      const normalizedCode = code.trim().toUpperCase();
      // Cross-platform: Simply navigate with query param
      // Platform-specific implementations can handle this differently
      router.push(`?ref=${normalizedCode}`);
    },
    [router]
  );

  return {
    ...state,
    setReferralCode,
    clearReferralCode,
    addToUrl,
    validateReferralCode,
  };
}
