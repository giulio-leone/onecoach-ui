'use client';

/**
 * DeployToClientsModal Component
 *
 * Modal riusabile per deployare workout/nutrition program ai clienti
 * Usato da coach, admin, super_admin per assegnazioni one-click
 */

import { useState, useEffect } from 'react';
import { Button, Checkbox, Input, Select } from '@giulio-leone/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@giulio-leone/ui/dialog';
import { useCoachClients } from '@giulio-leone/features/coach/hooks';
import { LoadingState } from '@giulio-leone/ui/components';
import { Users, Send, Check, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { logger } from '@giulio-leone/lib-shared';
import type { CoachClient } from '@giulio-leone/lib-api/queries/coach.queries';
type DeployResult = {
  userId: string;
  success: boolean;
  programId?: string;
  planId?: string;
  error?: string;
};

type DeployType = 'workout' | 'nutrition';

interface DeployToClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  type: DeployType;
  onSuccess?: (results: DeployResult[]) => void;
}

export function DeployToClientsModal({
  isOpen,
  onClose,
  templateId,
  templateName,
  type,
  onSuccess,
}: DeployToClientsModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [results, setResults] = useState<DeployResult[]>([]);
  const [step, setStep] = useState<'select' | 'results'>('select');
  const t = useTranslations();
  const tCommon = useTranslations('common');

  // Deploy options
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED_WITH_COACH'>(
    'SHARED_WITH_COACH'
  );
  const [roundingStep, setRoundingStep] = useState('2.5');

  const { data: clientsData, isLoading: clientsLoading } = useCoachClients();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
      setResults([]);
      setStep('select');
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredClients =
    clientsData?.clients?.filter(
      (c: CoachClient) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id: any) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedUsers(filteredClients.map((c: CoachClient) => c.id));
  };

  const deselectAll = () => {
    setSelectedUsers([]);
  };

  const handleDeploy = async () => {
    if (selectedUsers.length === 0) {
      toast.error(t('coach.deploy_to_clients_modal.seleziona_almeno_un_cliente'));
      return;
    }

    setIsDeploying(true);
    try {
      const endpoint = type === 'workout' ? '/api/workouts/deploy' : '/api/nutrition/deploy';
      const body: Record<string, unknown> = {
        templateId,
        userIds: selectedUsers,
        visibility,
        dryRun: false,
      };

      if (type === 'workout') {
        body.roundingStepKg = parseFloat(roundingStep) || 2.5;
      } else {
        body.roundingGrams = 1;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore deploy');
      }

      setResults(data.results || []);
      setStep('results');

      const successCount = data.results?.filter((r: DeployResult) => r.success).length || 0;
      toast.success(`Assegnato a ${successCount} clienti`);

      if (onSuccess) {
        onSuccess(data.results);
      }
    } catch (err) {
      logger.error(String(err));
      toast.error(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="text-primary-500 h-5 w-5" />
            {t('coach.deploy_to_clients_modal.assegna_a_clienti')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template info */}
          <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
            <div className="text-xs text-neutral-500 uppercase">
              {type === 'workout' ? 'Programma' : 'Piano Nutrizionale'}
            </div>
            <div className="font-semibold text-neutral-900 dark:text-white">{templateName}</div>
          </div>

          {step === 'select' ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder={t('coach.deploy_to_clients_modal.cerca_clienti')}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  {selectedUsers.length} / {filteredClients.length} selezionati
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="text-primary-600 h-auto p-0 hover:underline"
                  >
                    Tutti
                  </Button>
                  <span className="text-neutral-300">|</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAll}
                    className="text-primary-600 h-auto p-0 hover:underline"
                  >
                    Nessuno
                  </Button>
                </div>
              </div>

              {/* Clients list */}
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
                {clientsLoading ? (
                  <LoadingState message={t('common.loadingClients')} size="sm" />
                ) : filteredClients.length === 0 ? (
                  <div className="p-4 text-center text-sm text-neutral-500">
                    <Users className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                    {searchQuery ? 'Nessun cliente trovato' : 'Nessun cliente disponibile'}
                  </div>
                ) : (
                  filteredClients.map((client: CoachClient) => (
                    <label
                      key={client.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${
                        selectedUsers.includes(client.id)
                          ? 'bg-primary-50 dark:bg-primary-900/30'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Checkbox
                        id={client.id}
                        checked={selectedUsers.includes(client.id)}
                        onChange={() => toggleUser(client.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{client.name || 'Senza nome'}</div>
                        <div className="truncate text-xs text-neutral-500">{client.email}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {type === 'workout' && (
                  <Input
                    label={t('coach.deploy_to_clients_modal.arrotondamento_kg')}
                    value={roundingStep}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoundingStep(e.target.value)}
                    type="number"
                    step="0.5"
                  />
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t('coach.deploy_to_clients_modal.visibilita')}
                  </label>
                  <Select
                    value={visibility}
                    onValueChange={(value) =>
                      setVisibility(value as 'PRIVATE' | 'SHARED_WITH_COACH')
                    }
                    className="w-full"
                  >
                    <option value="SHARED_WITH_COACH">
                      {t('coach.deploy_to_clients_modal.visibile_a_te')}
                    </option>
                    <option value="PRIVATE">
                      {t('coach.deploy_to_clients_modal.solo_utente')}
                    </option>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <Button variant="secondary" onClick={onClose}>
                  Annulla
                </Button>
                <Button onClick={handleDeploy} disabled={isDeploying || selectedUsers.length === 0}>
                  {isDeploying ? (
                    'Assegnazione...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('coach.deploy_to_clients_modal.assegna_a')}
                      {selectedUsers.length} clienti
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Results view */
            <>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {results.map((r: any) => {
                  const client = clientsData?.clients?.find((c: CoachClient) => c.id === r.userId);
                  return (
                    <div
                      key={r.userId}
                      className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                        r.success
                          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{client?.name || r.userId}</div>
                        {r.error && <div className="text-xs text-red-600">{r.error}</div>}
                      </div>
                      {r.success ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <Button onClick={onClose}>Chiudi</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
