'use client';

import { useTranslations } from 'next-intl';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@giulio-leone/ui';
import { useDebounce } from '@giulio-leone/hooks';


interface BrandOption {
  id: string;
  name: string;
}

interface BrandComboboxProps {
  valueId?: string;
  valueName?: string;
  onChange: (val: { id?: string; name?: string } | null) => void;
  placeholder?: string;
}

export function BrandCombobox({
  valueId,
  valueName,
  onChange,
  placeholder = 'Seleziona brand...',
}: BrandComboboxProps) {
  const t = useTranslations('admin');

  const [query, setQuery] = useState(valueName || '');
  const [options, setOptions] = useState<BrandOption[]>([]);
  const [open, setOpen] = useState(false);
  const [_selected, setSelected] = useState<{ id?: string; name?: string } | null>(
    valueId || valueName ? { id: valueId, name: valueName } : null
  );
  const debounced = useDebounce(query, 250);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const url = new URL('/api/food/brands/autocomplete', window.location.origin);
      if (debounced) url.searchParams.set('q', debounced);
      url.searchParams.set('limit', '8');
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as { data?: BrandOption[] };
      if (!active) return;
      setOptions(json.data ?? []);
    };
    void load();
    return () => {
      active = false;
    };
  }, [debounced]);

  const handleSelect = (opt: BrandOption) => {
    setSelected(opt);
    setQuery(opt.name);
    setOpen(false);
    onChange({ id: opt.id, name: opt.name });
  };

  const showCreateHint = useMemo(() => {
    if (!query) return false;
    return !options.some((o) => o.name.toLowerCase() === query.toLowerCase());
  }, [options, query]);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setQuery(e.target.value);
          setOpen(true);
          onChange(e.target.value ? { name: e.target.value } : null);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {options.length === 0 && !query && (
            <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-500">
              {t('admin.brand_combobox.digita_per_cercare_brand')}
            </div>
          )}
          {options.map((opt: BrandOption) => (
            <button
              key={opt.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:bg-neutral-800/50"
              onClick={() => handleSelect(opt)}
            >
              {opt.name}
            </button>
          ))}
          {showCreateHint && (
            <div className="border-t px-3 py-2 text-xs text-neutral-500 dark:text-neutral-500">
              {t('admin.brand_combobox.creeremo_il_brand')}
              {query}
              {t('admin.brand_combobox.se_non_esiste')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
