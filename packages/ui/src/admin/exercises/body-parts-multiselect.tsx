'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@giulio-leone/ui';

interface Opt {
  id: string;
  name: string;
}

export function BodyPartsMultiselect({
  values,
  onChange,
}: {
  values: string[];
  onChange: (ids: string[]) => void;
}) {
  const [opts, setOpts] = useState<Opt[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const url = new URL('/api/exercises/body-parts', window.location.origin);
      if (q) url.searchParams.set('q', q);
      url.searchParams.set('limit', '50');
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (!active) return;
      setOpts(json.data || []);
    };
    void load();
    return () => {
      active = false;
    };
  }, [q]);

  const toggle = (id: string) => {
    const next = values.includes(id) ? values.filter((v: string) => v !== id) : [...values, id];
    onChange(next);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-left text-sm dark:border-white/[0.1]"
        onClick={() => setOpen((o) => !o)}
      >
        {values.length > 0 ? `${values.length} parti del corpo` : 'Seleziona parti del corpo'}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border border-neutral-200/60 bg-white p-2 shadow-lg dark:border-white/[0.08] dark:bg-zinc-950">
          <input
            className="mb-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm dark:border-white/[0.1]"
            placeholder="Cerca..."
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          />
          <div className="space-y-1">
            {opts.map((o: Opt) => (
              <Checkbox
                key={o.id}
                label={o.name}
                checked={values.includes(o.id)}
                onChange={() => toggle(o.id)}
                className="px-2 py-1 hover:bg-neutral-50 dark:hover:bg-white/[0.06]/50"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
