'use client';

import { useEffect, useState } from 'react';
import { Input } from '@giulio-leone/ui';

interface Option {
  id: string;
  name: string;
}

export function ExerciseTypeCombobox({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const selectedName = options.find((o: any) => o.id === value)?.name;

  useEffect(() => {
    let active = true;
    const load = async () => {
      const url = new URL('/api/exercises/types', window.location.origin);
      if (query) url.searchParams.set('q', query);
      url.searchParams.set('limit', '20');
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as { data?: Option[] };
      if (!active) return;
      setOptions(json.data ?? []);
    };
    void load();
    return () => {
      active = false;
    };
  }, [query]);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-left text-sm dark:border-neutral-600 dark:bg-zinc-950"
        onClick={() => setOpen((o) => !o)}
      >
        {selectedName || 'Tipo esercizio'}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-zinc-950">
          <Input
            placeholder="Cerca..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            className="mb-2"
          />
          {options.map((opt: Option) => (
            <button
              key={opt.id}
              type="button"
              className={`block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-white/[0.06] ${value === opt.id ? 'bg-neutral-100 font-medium dark:bg-white/[0.04]' : ''}`}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
