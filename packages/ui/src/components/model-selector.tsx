'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '../input';
import { Select } from '../select';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import type { ModelOption } from './model-selector-modal';

interface ModelSelectorProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModelSelector({
  value,
  onChange,
  placeholder = 'Select a model...',
  className,
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/config/openrouter-models');
        const data = await res.json();
        if (data.success) {
          setModels(
            data.models.map((m: any) => ({
              id: m.modelId,
              name: m.name,
              provider: 'openrouter',
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch models', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter models
  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.id.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = providerFilter === 'all' || model.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  // Unique providers for filter
  const providers = Array.from(new Set(models.map((m) => m.provider))).sort();

  const selectedModel = models.find((m) => m.id === value);

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Trigger Button (Input-like) */}
      <div
        className="flex w-full cursor-pointer items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-300"
        onClick={() => {
          setIsOpen(!isOpen);
          // Focus search input on open if needed, but let's keep it simple
        }}
      >
        <span className={cn(!selectedModel && 'text-neutral-500')}>
          {selectedModel ? selectedModel.name : value || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 shadow-md dark:border-neutral-800 dark:bg-neutral-950">
          {/* Search & Filter Header */}
          <div className="mb-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search model..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="h-9 pl-8"
                autoFocus
              />
            </div>
            <div className="w-1/3">
              <Select
                value={providerFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setProviderFilter(e.target.value)
                }
                className="h-9 text-xs"
              >
                <option value="all">All Providers</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[300px] space-y-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-neutral-500">Loading models...</div>
            ) : filteredModels.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">No models found.</div>
            ) : (
              filteredModels.map((model: any) => (
                <div
                  key={model.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    value === model.id && 'bg-neutral-100 font-medium dark:bg-neutral-800'
                  )}
                  onClick={() => {
                    onChange(model.id);
                    setIsOpen(false);
                    setSearch(''); // Reset search on select
                  }}
                >
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-[10px] text-neutral-500">
                      {model.provider}/{model.id.split('/').pop()}
                    </span>
                  </div>
                  {value === model.id && <Check className="h-4 w-4 text-green-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
