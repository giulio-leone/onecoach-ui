'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '../../input';
import { Select } from '../../select';
import { Search, Check, ChevronsUpDown, Sparkles, Box, Cpu, Zap } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import type { ModelOption } from './model-selector-modal';
import { Drawer } from '../../drawer';

interface ModelSelectorProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ProviderIcon = ({ provider, className }: { provider: string; className?: string }) => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return <Sparkles className={className} />;
    case 'anthropic':
      return <Box className={className} />;
    case 'google':
      return <Cpu className={className} />;
    default:
      return <Zap className={className} />;
  }
};

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
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Click outside to close (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Filter models
  const filteredModels = models.filter((model: any) => {
    const matchesSearch =
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.id.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = providerFilter === 'all' || model.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  // Unique providers for filter
  const providers = Array.from(new Set(models.map((m: any) => m.provider))).sort();

  const selectedModel = models.find((m: any) => m.id === value);

  const ModelListContent = () => (
    <div className="flex h-full flex-col">
      {/* Search & Filter Header */}
      <div className="mb-4 flex shrink-0 gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search model..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="h-9 border-neutral-200/60 bg-neutral-50 pl-8 dark:border-white/10 dark:bg-white/5"
            autoFocus={!isMobile}
          />
        </div>
        <div className="w-1/3">
          <Select
            value={providerFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setProviderFilter(e.target.value)
            }
            className="h-9 border-neutral-200/60 bg-neutral-50 text-xs dark:border-white/10 dark:bg-white/5"
          >
            <option value="all">All</option>
            {providers.map((p: any) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* List */}
      <div className={cn('space-y-1 overflow-y-auto', isMobile ? 'flex-1' : 'max-h-[300px]')}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs text-neutral-500">Loading models...</span>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-8 text-center text-xs text-neutral-500 dark:bg-white/5">
            No models found.
          </div>
        ) : (
          filteredModels.map((model: ModelOption) => (
            <div
              key={model.id}
              className={cn(
                'group flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-sm transition-all',
                'hover:bg-neutral-100 dark:hover:bg-white/10',
                value === model.id
                  ? 'border border-indigo-200 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/10'
                  : 'border border-transparent'
              )}
              onClick={() => {
                onChange(model.id);
                setIsOpen(false);
                setSearch('');
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    value === model.id
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                      : 'bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:shadow-sm dark:bg-white/5 dark:text-neutral-400 dark:group-hover:bg-white/10'
                  )}
                >
                  <ProviderIcon provider={model.provider} className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      'font-medium',
                      value === model.id
                        ? 'text-indigo-900 dark:text-indigo-100'
                        : 'text-neutral-700 dark:text-neutral-200'
                    )}
                  >
                    {model.name}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {model.provider} • {model.id.split('/').pop()}
                  </span>
                </div>
              </div>
              {value === model.id && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('relative inline-block', className)} ref={containerRef}>
      {/* Trigger Button (Pill Style) */}
      <button
        type="button"
        className={cn(
          'group flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200',
          'border border-neutral-200/50 bg-white/50 backdrop-blur-md hover:border-neutral-300/50 hover:bg-white/80 hover:shadow-md',
          'dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Sparkles className="h-3 w-3" />
          </div>
          <span className="max-w-[120px] truncate text-xs font-medium text-neutral-700 dark:text-neutral-200">
            {selectedModel ? selectedModel.name : value || placeholder}
          </span>
        </div>
        <ChevronsUpDown className="h-3 w-3 text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300" />
      </button>

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          position="bottom"
          title="Seleziona Modello AI"
          size="lg"
          mobileFullScreen={true}
        >
          <ModelListContent />
        </Drawer>
      ) : (
        /* Desktop Dropdown */
        isOpen && (
          <div className="animate-in fade-in zoom-in-95 absolute top-full left-0 z-50 mt-2 w-[320px] origin-top-left rounded-2xl border border-white/20 bg-white/80 p-3 shadow-xl backdrop-blur-xl duration-200 dark:border-white/10 dark:bg-neutral-900/80">
            <ModelListContent />
          </div>
        )
      )}
    </div>
  );
}
