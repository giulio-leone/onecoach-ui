/**
 * Food AI Edit Modal
 *
 * Modal per modificare alimenti usando AI con prompt personalizzabile.
 */
'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '../../button';
import { Modal, ModalFooter } from '../../dialog';
import { cn } from '@giulio-leone/lib-design-system';
import { LoadingState, ErrorState } from '@giulio-leone/ui/components';
import { Brain, Sparkles, X } from 'lucide-react';
import { useUpdateFoodWithAI } from '@giulio-leone/features/food/hooks';
import { logger } from '@giulio-leone/lib-shared';
interface FoodAiEditModalProps {
  isOpen: boolean;
  foodId: string;
  currentFoodName?: string;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}
const DEFAULT_UPDATE_PROMPT = `You are a nutrition expert. Update a food item based on the user's description and current food data.
CURRENT FOOD DATA:
{currentFoodData}
REQUIRED OUTPUT FORMAT (JSON only):
{
  "name": "Updated food name (include preparation state: raw, cooked, etc.)",
  "description": "Updated detailed description (min 10, max 2000 characters) - REQUIRED",
  "macrosPer100g": {
    "calories": <number>, // REQUIRED - kcal per 100g RAW weight
    "protein": <number>,  // REQUIRED - grams per 100g RAW weight
    "carbs": <number>,    // REQUIRED - grams per 100g RAW weight
    "fats": <number>      // REQUIRED - grams per 100g RAW weight
  },
  "servingSize": <number>, // REQUIRED - Standard serving in grams
  "unit": "g",             // REQUIRED - Default "g" for grams
  "brandName": "<brand name or 'Generic'>", // Optional - used to find/create brand
  "imageUrl": "<image URL or null>", // Optional - leave null if no image available
  "barcode": "<optional barcode>" // Optional - EAN/UPC code for packaged foods
}
REQUIRED FIELDS (MUST BE PRESENT - NO EXCEPTIONS):
1. name: String (2-255 characters) - Food name with preparation state
2. description: String (min 10, max 2000 characters) - Detailed food description - REQUIRED, cannot be null or empty
3. macrosPer100g: Object with calories, protein, carbs, fats (all numbers)
4. servingSize: Number (1-10000) - Standard serving size in grams
5. unit: String (default "g") - Unit of measurement
OPTIONAL FIELDS (only barcode is truly optional):
- brandName: String - Brand name (will default to "Generic" if not provided)
- imageUrl: String or null - Product image URL (leave null if no image available, do NOT use placeholder URLs)
- barcode: String or null - EAN/UPC barcode for packaged foods (ONLY truly optional field - can be omitted or null)
CRITICAL RULES:
- ALL macros MUST be per 100g RAW/UNCOOKED weight (NOT cooked weight)
- Use realistic nutritional values from reliable sources
- Include preparation state in name (e.g., "Chicken breast, raw", "Pasta, cooked")
- servingSize guidelines: 100g for most foods, 30g for cheese/nuts, 200-250g for liquids
- description is MANDATORY and must be detailed (min 10 chars, max 2000 chars) and include preparation state and key characteristics
- NEVER return null or empty string for description - it is REQUIRED
- Return ONLY valid JSON, no markdown, no explanations
- The system automatically calculates: mainMacro, proteinPct, carbPct, fatPct`;
export function FoodAiEditModal({
  isOpen,
  foodId,
  currentFoodName,
  onClose,
  onSuccess,
}: FoodAiEditModalProps) {
  const t = useTranslations();
  const [description, setDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_UPDATE_PROMPT);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const updateFoodWithAI = useUpdateFoodWithAI();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 3) {
      return;
    }
    const data = {
      description: description.trim(),
      customPrompt: showAdvanced && customPrompt.trim() ? customPrompt.trim() : undefined,
    };
    try {
      await updateFoodWithAI.mutateAsync({
        id: foodId,
        data: { description: data.description, customPrompt: data.customPrompt },
      });
      await onSuccess();
      onClose();
      setDescription('');
    } catch (error: unknown) {
      logger.error('Error updating food with AI:', error);
    }
  };
  const isSubmitting = updateFoodWithAI.isPending;
  const error = updateFoodWithAI.error;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('food_ai_edit_modal.modifica_alimento_con_ai')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentFoodName && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <strong>{t('food_ai_edit_modal.alimento_corrente')}</strong> {currentFoodName}
          </div>
        )}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('food_ai_edit_modal.descrizione_dell_alimento')}
          </label>
          <textarea
            id="description"
            placeholder={t('food_ai_edit_modal.es_aggiorna_i_valori_nutrizionali_25g_pr')}
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            disabled={isSubmitting}
            required
            rows={4}
            className={cn(
              'w-full rounded-md border px-3 py-2 text-sm',
              'border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
              'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              'dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-900'
            )}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('food_ai_edit_modal.descrivi_le_modifiche_che_vuoi_apportare')}
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Sparkles className="h-4 w-4" />
            {showAdvanced ? 'Nascondi' : 'Mostra'} {t('food_ai_edit_modal.prompt_personalizzato')}
          </button>
        </div>
        {showAdvanced && (
          <div>
            <label
              htmlFor="customPrompt"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('food_ai_edit_modal.prompt_personalizzato_opzionale')}
            </label>
            <textarea
              id="customPrompt"
              placeholder={t('food_ai_edit_modal.inserisci_un_prompt_personalizzato_per_l')}
              value={customPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCustomPrompt(e.target.value)
              }
              disabled={isSubmitting}
              rows={12}
              className={cn(
                'w-full rounded-md border px-3 py-2 font-mono text-xs',
                'border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
                'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                'dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-900'
              )}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('food_ai_edit_modal.il_prompt_personalizzato_sovrascrivera_q')}
            </p>
          </div>
        )}
        {error && (
          <ErrorState
            error={error instanceof Error ? error : new Error(t('common.errors.unknown'))}
            title={t('food_ai_edit_modal.errore_durante_la_modifica')}
          />
        )}
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting || !description.trim()}>
            {isSubmitting ? (
              <>
                <LoadingState size="sm" className="mr-2" />
                Aggiornamento...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                {t('food_ai_edit_modal.aggiorna_con_ai')}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
