'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@onecoach/lib-design-system';

interface WizardStepProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  isActive: boolean;
  direction?: number;
  className?: string;
}

export function WizardStep({
  children,
  title,
  description,
  isActive,
  direction = 1,
  className,
}: WizardStepProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      {isActive && (
        <motion.div
          key={title}
          custom={direction}
          initial={{ x: direction * 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -50, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn('w-full', className)}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{title}</h2>
            {description && (
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">{description}</p>
            )}
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
