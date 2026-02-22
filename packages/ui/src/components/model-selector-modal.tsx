'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Check, ChevronsUpDown, Box } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Modal } from '../dialog';
import { Input } from '../input';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

interface ModelSelectorModalProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModelSelectorModal({
  value,
  onChange,
  placeholder = 'Select a model...',
  className,
}: ModelSelectorModalProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/config/openrouter-models');
        const data = await res.json();
        if (data.success) {
          setModels(
            data.models.map((m: { modelId: string; name: string }) => ({
              id: m.modelId,
              name: m.name,
              provider: 'openrouter', // The API returns OpenRouter models, but they have internal providers
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch models', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && models.length === 0) {
      fetchModels();
    }
  }, [isOpen, models.length]);

  // Filter models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.id.toLowerCase().includes(search.toLowerCase());
      // For OpenRouter, the provider is usually part of the ID or name, but here we simplify
      // If we had real provider data, we would filter by it.
      // For now, we'll just filter by search.
      return matchesSearch;
    });
  }, [models, search]);

  const selectedModel =
    models.find((m) => m.id === value) ||
    (value ? { id: value, name: value, provider: 'unknown' } : null);

  return (
    <>
      <div
        className={cn(
          'flex w-full cursor-pointer items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white transition-all hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-black/40 dark:text-white dark:ring-offset-neutral-950 dark:hover:bg-white/5 dark:focus:ring-neutral-300',
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2 truncate">
          <Box className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <span
            className={cn('truncate', !selectedModel && 'text-neutral-500 dark:text-neutral-500')}
          >
            {selectedModel ? selectedModel.name : placeholder}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Model" size="lg">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="bg-neutral-50 pl-9 dark:bg-neutral-900"
              autoFocus
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 text-neutral-500">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600" />
                <span className="mt-2 text-xs">Loading models...</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                No models found matching "{search}"
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredModels.map((model: any) => (
                  <button
                    key={model.id}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900',
                      value === model.id && 'bg-blue-50 dark:bg-blue-900/10'
                    )}
                    onClick={() => {
                      onChange(model.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          value === model.id
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                        )}
                      >
                        <Box size={16} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span
                          className={cn(
                            'truncate text-sm font-medium',
                            value === model.id
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-neutral-900 dark:text-neutral-200'
                          )}
                        >
                          {model.name}
                        </span>
                        <span className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-500">
                          {model.id}
                        </span>
                      </div>
                    </div>
                    {value === model.id && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between text-xs text-neutral-400">
            <span>{filteredModels.length} models available</span>
            <span>Powered by OpenRouter</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
