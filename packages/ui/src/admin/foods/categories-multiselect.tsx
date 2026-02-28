'use client';

import { useTranslations } from 'next-intl';

import { useEffect, useState } from 'react';
import { Checkbox } from '@giulio-leone/ui';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoriesMultiselectProps {
  values: string[];
  onChange: (ids: string[]) => void;
}

export function CategoriesMultiselect({ values, onChange }: CategoriesMultiselectProps) {
  const t = useTranslations('admin');

  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const url = new URL('/api/food/categories', window.location.origin);
      if (query) url.searchParams.set('q', query);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as { data?: Category[] };
      if (!active) return;
      setCats(json.data ?? []);
    };
    void load();
    return () => {
      active = false;
    };
  }, [query]);

  const toggle = (id: string) => {
    const has = values.includes(id);
    const next = has ? values.filter((v: string) => v !== id) : [...values, id];
    onChange(next);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-left text-sm dark:border-neutral-600"
        onClick={() => setOpen((o) => !o)}
      >
        {values.length > 0 ? `${values.length} categorie selezionate` : 'Seleziona categorie'}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-zinc-950">
          <input
            className="mb-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600"
            placeholder={t('admin.categories_multiselect.cerca_categoria')}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          />
          <div className="space-y-1">
            {cats.map((c: Category) => (
              <Checkbox
                key={c.id}
                label={c.name}
                checked={values.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="px-2 py-1 hover:bg-neutral-50 dark:hover:bg-white/[0.06]/50"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
