'use client';

import { useTranslations } from 'next-intl';
/**
 * OneRMEstimator Component
 *
 * Component per stimare il 1RM da reps × peso
 * Usa la formula Epley con correzione RPE
 */

import { useState, useMemo, useCallback } from 'react';
import { Calculator, Info, Check } from 'lucide-react';
import { estimateOneRMFromReps } from '@giulio-leone/lib-workout/intensity-calculator';
import { kgToLbs, lbsToKg } from '@giulio-leone/lib-shared';
import { useWeightUnit } from '@giulio-leone/lib-api/hooks';
import { Tooltip } from '@giulio-leone/ui';

interface OneRMEstimatorProps {
  exerciseName: string;
  exerciseId: string;
  onEstimate: (exerciseId: string, estimatedOneRM: number) => void;
  className?: string;
}

export function OneRMEstimator({
  exerciseName,
  exerciseId,
  onEstimate,
  className = '',
}: OneRMEstimatorProps) {
  const t = useTranslations('workouts');

  const weightUnit = useWeightUnit();
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [rpe, setRpe] = useState<string>('8');
  const [showEstimate, setShowEstimate] = useState(false);

  const estimatedOneRM = useMemo(() => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    const rpeNum = parseFloat(rpe);

    if (isNaN(weightNum) || isNaN(repsNum) || isNaN(rpeNum)) {
      return null;
    }

    if (weightNum <= 0 || repsNum <= 0 || repsNum > 30 || rpeNum < 1 || rpeNum > 10) {
      return null;
    }

    try {
      // Convert to kg if user is using lbs
      const weightKg = weightUnit === 'LBS' ? lbsToKg(weightNum) : weightNum;
      const estimated = estimateOneRMFromReps(repsNum, weightKg, rpeNum);
      return estimated;
    } catch {
      return null;
    }
  }, [weight, reps, rpe, weightUnit]);

  const displayEstimate = useMemo(() => {
    if (estimatedOneRM === null) return null;
    if (weightUnit === 'LBS') {
      return kgToLbs(estimatedOneRM).toFixed(1);
    }
    return estimatedOneRM.toFixed(1);
  }, [estimatedOneRM, weightUnit]);

  const handleUseEstimate = useCallback(() => {
    if (estimatedOneRM !== null) {
      onEstimate(exerciseId, estimatedOneRM);
      setShowEstimate(true);
    }
  }, [estimatedOneRM, exerciseId, onEstimate]);

  const getRpeDescription = (rpeValue: number): string => {
    if (rpeValue >= 10) return 'Sforzo massimo, 0 reps in riserva';
    if (rpeValue >= 9) return 'Potevi fare 1 altra ripetizione';
    if (rpeValue >= 8) return 'Potevi fare 2-3 altre ripetizioni';
    if (rpeValue >= 7) return 'Potevi fare 3-4 altre ripetizioni';
    if (rpeValue >= 6) return 'Potevi fare 4+ altre ripetizioni';
    return 'Sforzo leggero';
  };

  if (showEstimate && estimatedOneRM) {
    return (
      <div
        className={`rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20 ${className}`}
      >
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              {t('workouts.one_rm_estimator.1rm_stimato')}
              {displayEstimate} {weightUnit === 'LBS' ? 'lbs' : 'kg'}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {t('workouts.one_rm_estimator.basato_su')}
              {reps} {t('workouts.one_rm_estimator.reps')}
              {weight} {weightUnit === 'LBS' ? 'lbs' : 'kg'} {t('workouts.one_rm_estimator.rpe')}
              {rpe}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEstimate(false)}
          className="mt-2 text-xs text-green-600 underline hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
        >
          Ricalcola
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-white/[0.04] ${className}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {t('workouts.one_rm_estimator.stima_1rm_per')}
          {exerciseName}
        </h4>
        <Tooltip content="Inserisci peso × reps di un set recente e otterrai una stima del tuo massimale">
          <Info className="h-4 w-4 cursor-help text-neutral-400" />
        </Tooltip>
      </div>

      <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
        {t('workouts.one_rm_estimator.non_conosci_il_tuo_1rm_inserisci_un_set_')}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {/* Weight Input */}
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {t('workouts.one_rm_estimator.peso')}
            {weightUnit === 'LBS' ? 'lbs' : 'kg'})
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max={weightUnit === 'LBS' ? '2205' : '1000'}
            value={weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
            placeholder={weightUnit === 'LBS' ? '176' : '80'}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        {/* Reps Input */}
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Ripetizioni
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={reps}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReps(e.target.value)}
            placeholder="8"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        {/* RPE Input */}
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            RPE
            <Tooltip content={rpe ? getRpeDescription(parseFloat(rpe)) : 'Sforzo percepito 1-10'}>
              <Info className="ml-1 inline h-3 w-3 cursor-help text-neutral-400" />
            </Tooltip>
          </label>
          <select
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRpe(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          >
            <option value="10">{t('workouts.one_rm_estimator.10_max')}</option>
            <option value="9.5">9.5</option>
            <option value="9">9</option>
            <option value="8.5">8.5</option>
            <option value="8">8</option>
            <option value="7.5">7.5</option>
            <option value="7">7</option>
            <option value="6">6</option>
          </select>
        </div>
      </div>

      {/* Estimate Display */}
      {estimatedOneRM !== null && (
        <div className="mt-4">
          <div className="mb-2 rounded-md bg-primary-50 p-3 dark:bg-primary-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  {t('workouts.one_rm_estimator.1rm_stimato')}
                  <span className="text-lg">{displayEstimate}</span>{' '}
                  {weightUnit === 'LBS' ? 'lbs' : 'kg'}
                </p>
                <p className="mt-1 text-xs text-primary-700 dark:text-primary-300">
                  {t('workouts.one_rm_estimator.formula_epley_peso_1_reps_30_con_correzi')}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleUseEstimate}
            className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            {t('workouts.one_rm_estimator.usa_questa_stima_come_1rm')}
          </button>
        </div>
      )}

      {/* Validation Messages */}
      {weight && reps && !estimatedOneRM && (
        <p className="mt-2 text-xs text-red-500">
          {t('workouts.one_rm_estimator.controlla_i_valori_inseriti_reps_deve_es')}
        </p>
      )}
    </div>
  );
}

export default OneRMEstimator;
