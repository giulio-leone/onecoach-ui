/**
 * useReferralTracking Hook
 *
 * Hook per gestire il tracciamento dei referral code
 * attraverso la navigazione e il checkout
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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

  const searchParams = useSearchParams();
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

  // Check for referral parameter in URL
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam && refParam.trim() && !state.referralCode) {
      const normalizedCode = refParam.trim().toUpperCase();
      setState((prev) => ({
        ...prev,
        referralCode: normalizedCode,
        isChecking: true,
      }));
    }
  }, [searchParams, state.referralCode]);

  // Validate when we have a code that needs checking
  useEffect(() => {
    if (state.referralCode && state.isChecking && !validationInProgressRef.current) {
      validateReferralCode(state.referralCode);
    }
  }, [state.referralCode, state.isChecking, validateReferralCode]);

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

    // Remove from URL
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('ref');
    const newUrl = `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, router]);

  const addToUrl = useCallback(
    (code: string) => {
      const normalizedCode = code.trim().toUpperCase();
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('ref', normalizedCode);
      const newUrl = `${window.location.pathname}?${newParams.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router]
  );

  return {
    ...state,
    setReferralCode,
    clearReferralCode,
    addToUrl,
    validateReferralCode,
  };
}
