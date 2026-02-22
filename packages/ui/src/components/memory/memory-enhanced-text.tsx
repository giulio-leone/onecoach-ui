/**
 * Memory Enhanced Text Component
 *
 * Component for enhancing text using AI.
 * KISS: Simple textarea with enhance button
 */

'use client';

import React, { useState } from 'react';
import { Button } from '../../button';
import { Textarea } from '../../textarea';
import { Sparkles } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface MemoryEnhancedTextProps {
  value: string;
  onChange: (value: string) => void;
  onEnhanced?: (enhanced: string) => void;
  placeholder?: string;
  context?: string;
  domain?: string;
  className?: string;
  disabled?: boolean;
}

export function MemoryEnhancedText({
  value,
  onChange,
  onEnhanced,
  placeholder,
  context,
  domain,
  className,
  disabled,
}: MemoryEnhancedTextProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!value.trim()) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const response = await fetch('/api/memory/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value,
          context,
          domain,
          style: 'professional',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const data = await response.json();
      onChange(data.enhanced);
      onEnhanced?.(data.enhanced);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il miglioramento');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isEnhancing}
          className="min-h-[100px] pr-20"
        />
        {value.trim() && (
          <Button
            variant="ghost"
            size="sm"
            icon={Sparkles}
            iconOnly
            onClick={handleEnhance}
            disabled={disabled || isEnhancing}
            className="absolute right-2 bottom-2"
            title="Migliora con AI"
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {isEnhancing && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Miglioramento in corso...</p>
      )}
    </div>
  );
}
