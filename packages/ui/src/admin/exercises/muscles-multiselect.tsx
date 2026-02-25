'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '../../checkbox';

interface Opt {
  id: string;
  name: string;
}

interface MusclesMultiselectProps {
  primary: string[];
  secondary: string[];
  onChange: (val: { primary: string[]; secondary: string[] }) => void;
}

export function MusclesMultiselect({ primary, secondary, onChange }: MusclesMultiselectProps) {
  const [opts, setOpts] = useState<Opt[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const url = new URL('/api/exercises/muscles', window.location.origin);
      if (q) url.searchParams.set('q', q);
      url.searchParams.set('limit', '100');
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as { data?: Opt[] };
      if (!active) return;
      setOpts(json.data ?? []);
    };
    void load();
    return () => {
      active = false;
    };
  }, [q]);

  const toggle = (role: 'primary' | 'secondary', id: string) => {
    const src = role === 'primary' ? primary : secondary;
    const next = src.includes(id) ? src.filter((v: string) => v !== id) : [...src, id];
    onChange(role === 'primary' ? { primary: next, secondary } : { primary, secondary: next });
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-left text-sm dark:border-neutral-600"
        onClick={() => setOpen((o) => !o)}
      >
        {primary.length + secondary.length > 0
          ? `${primary.length} primari, ${secondary.length} secondari`
          : 'Seleziona muscoli'}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <input
            className="mb-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600"
            placeholder="Cerca..."
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-500">
                Primari
              </div>
              {opts.map((o: Opt) => (
                <Checkbox
                  key={o.id}
                  label={o.name}
                  checked={primary.includes(o.id)}
                  onChange={() => toggle('primary', o.id)}
                  className="px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                />
              ))}
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-500">
                Secondari
              </div>
              {opts.map((o: Opt) => (
                <Checkbox
                  key={o.id}
                  label={o.name}
                  checked={secondary.includes(o.id)}
                  onChange={() => toggle('secondary', o.id)}
                  className="px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
