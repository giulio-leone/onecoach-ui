'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface NutritionHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function NutritionHeader({
  title,
  subtitle,
  backUrl,
  backLabel = 'Indietro',
  actions,
}: NutritionHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between border-b border-neutral-800 pb-8">
      <div className="flex-1 space-y-4">
        {backUrl && (
          <Link
            href={backUrl}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 transition-colors hover:text-emerald-400"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {backLabel}
          </Link>
        )}

        <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
            </h1>
            {subtitle && (
            <p className="max-w-2xl text-lg text-neutral-400 font-medium">
                {subtitle}
            </p>
            )}
        </div>
      </div>

      {actions && <div className="flex gap-4">{actions}</div>}
    </div>
  );
}
