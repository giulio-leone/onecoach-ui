/**
 * useBidirectionalWeightCalc Hook
 *
 * Hook per calcolare automaticamente peso e intensità in modo bidirezionale quando disponibile 1RM
 * - Se intensityPercent cambia → calcola weight
 * - Se weight cambia → calcola intensityPercent
 *
 * NOTE: This is a pure version of the hook that does NOT fetch 1RM.
 * It receives oneRepMax as a parameter.
 */

'use client';

import { useEffect, useRef } from 'react';
import { calculateWeightFromIntensity, calculateIntensityFromWeight } from '@giulio-leone/one-workout';
import { kgToLbs } from '@giulio-leone/lib-shared';

export interface UseBidirectionalWeightCalcParams {
  intensityPercent?: number | null;
  weight?: number | null;
  oneRepMax: number | null;
  onWeightChange: (weight: number | undefined, weightLbs?: number | undefined) => void;
  onIntensityChange: (intensityPercent: number | undefined) => void;
  weightInputFocused?: boolean;
  intensityInputFocused?: boolean;
}

export function useBidirectionalWeightCalc({
  intensityPercent,
  weight,
  oneRepMax,
  onWeightChange,
  onIntensityChange,
  weightInputFocused = false,
  intensityInputFocused = false,
}: UseBidirectionalWeightCalcParams) {
  // Ref per tracciare se siamo in mezzo a un aggiornamento automatico
  const isCalculating = useRef(false);
  // Ref per tracciare i valori precedenti
  const prevIntensity = useRef<number | null | undefined>(intensityPercent);
  const prevWeight = useRef<number | null | undefined>(weight);

  // Stabilizzare i callback usando ref per evitare dipendenze instabili
  const onWeightChangeRef = useRef(onWeightChange);
  const onIntensityChangeRef = useRef(onIntensityChange);

  useEffect(() => {
    onWeightChangeRef.current = onWeightChange;
  }, [onWeightChange]);

  useEffect(() => {
    onIntensityChangeRef.current = onIntensityChange;
  }, [onIntensityChange]);

  // Calcola peso da intensità quando l'intensità cambia
  useEffect(() => {
    // Skip conditions
    if (
      !oneRepMax ||
      intensityPercent === undefined ||
      intensityPercent === null ||
      intensityPercent <= 0 ||
      intensityPercent > 100 ||
      weightInputFocused ||
      isCalculating.current
    ) {
      prevIntensity.current = intensityPercent;
      return;
    }

    const intensityChanged = prevIntensity.current !== intensityPercent;
    if (!intensityChanged) {
      return;
    }

    try {
      const expectedWeight = calculateWeightFromIntensity(oneRepMax, intensityPercent);
      const tolerance = 0.01;
      const currentWeight = weight ?? 0;

      if (Math.abs(currentWeight - expectedWeight) > tolerance) {
        isCalculating.current = true;
        const expectedWeightLbs = kgToLbs(expectedWeight);
        onWeightChangeRef.current(expectedWeight, expectedWeightLbs);

        queueMicrotask(() => {
          isCalculating.current = false;
        });
      }
    } catch (_error) {
      isCalculating.current = false;
    }

    prevIntensity.current = intensityPercent;
  }, [oneRepMax, intensityPercent, weightInputFocused, weight]);

  // Calcola intensità da peso quando il peso cambia
  useEffect(() => {
    // Skip conditions
    if (
      !oneRepMax ||
      weight === undefined ||
      weight === null ||
      weight <= 0 ||
      intensityInputFocused ||
      isCalculating.current
    ) {
      prevWeight.current = weight;
      return;
    }

    const weightChanged = prevWeight.current !== weight;
    if (!weightChanged) {
      return;
    }

    try {
      const expectedIntensity = calculateIntensityFromWeight(weight, oneRepMax);
      const tolerance = 0.1;
      const currentIntensity = intensityPercent ?? 0;

      if (Math.abs(currentIntensity - expectedIntensity) > tolerance) {
        isCalculating.current = true;
        onIntensityChangeRef.current(expectedIntensity);

        queueMicrotask(() => {
          isCalculating.current = false;
        });
      }
    } catch (_error) {
      isCalculating.current = false;
    }

    prevWeight.current = weight;
  }, [oneRepMax, weight, intensityInputFocused, intensityPercent]);
}
