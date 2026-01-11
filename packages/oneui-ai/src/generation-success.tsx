'use client';

import { CheckIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card } from '@onecoach/ui';

interface GenerationSuccessProps {
  title: string;
  message: string;
  onReset: () => void;
  onAction: () => void;
  actionLabel: string;
  stats?: Array<{ label: string; value: string | number }>;
}

export function GenerationSuccess({
  title,
  message,
  onReset,
  onAction,
  actionLabel,
  stats,
}: GenerationSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="mx-auto max-w-lg"
    >
      <Card className="border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-500/5 dark:border-emerald-900/30 dark:bg-neutral-900">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
          >
            <CheckIcon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </motion.div>

          <h3 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">{title}</h3>
          <p className="mb-8 text-neutral-600 dark:text-neutral-400">{message}</p>

          {stats && stats.length > 0 && (
            <div className="mb-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <div key={i} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
                  <div className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    {stat.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
              Ricomincia
            </Button>
            <Button
              onClick={onAction}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto"
            >
              {actionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
