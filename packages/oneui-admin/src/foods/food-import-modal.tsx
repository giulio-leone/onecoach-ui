/**
 * FoodImportModal
 *
 * Import da CSV/JSON con preview esito dedup.
 */
'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button, Modal, ModalFooter } from '@giulio-leone/ui';
import { Upload } from 'lucide-react';
import { handleApiError } from '@giulio-leone/lib-shared';
interface FoodImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}
type ImportResult = {
  foodItem?: { name?: string; metadata?: { brand?: string } };
  matchType?: 'exact' | 'bm25' | 'fuzzy' | 'created';
};
export function FoodImportModal({ isOpen, onClose, onImported }: FoodImportModalProps) {
  const t = useTranslations();
  const tAdmin = useTranslations('admin');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const text = await file.text();
      let body: BodyInit;
      let headers: HeadersInit;
      if (file.type.includes('json') || file.name.endsWith('.json')) {
        headers = { 'Content-Type': 'application/json' };
        const parsed = JSON.parse(text);
        body = JSON.stringify(Array.isArray(parsed) ? { items: parsed } : parsed);
      } else {
        headers = { 'Content-Type': 'text/csv' };
        body = text;
      }
      const res = await fetch('/api/admin/foods/import', { method: 'POST', headers, body });
      if (!res.ok) {
        const error = await handleApiError(res);
        throw error;
      }
      const json = await res.json();
      setResults((json.results as ImportResult[] | undefined) ?? []);
      onImported((json.imported as number | undefined) ?? 0);
      onImported((json.imported as number | undefined) ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : tAdmin('common.errors.unknown'));
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('food_import_modal.import_catalogo_alimenti')}
      size="lg"
    >
      <div className="space-y-3">
        <input
          type="file"
          accept=".csv,.json,application/json,text/csv"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFile(e.target.files?.[0] || null)
          }
        />
        <div className="text-xs text-neutral-500 dark:text-neutral-500">
          {t('food_import_modal.csv_headers_consigliati_name_calories_pr')}
        </div>
        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      </div>
      {results && (
        <div className="mt-4 max-h-64 overflow-auto rounded border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Marca</th>
                <th className="px-3 py-2">Esito</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{r.foodItem?.name}</td>
                  <td className="px-3 py-2">{r.foodItem?.metadata?.brand || '-'}</td>
                  <td className="px-3 py-2 capitalize">{r.matchType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ModalFooter>
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Importa
        </Button>
      </ModalFooter>
    </Modal>
  );
}
