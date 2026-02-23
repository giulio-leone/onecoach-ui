'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  isSaving?: boolean;
  className?: string;
}

export function NotesInput({
  value,
  onChange,
  placeholder = 'Add notes...',
  maxLength = 500,
  showCharacterCount = true,
  isSaving = false,
  className = '',
}: NotesInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    onChange(newValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full resize-none rounded-xl border border-neutral-200 bg-white/50 p-4 text-sm backdrop-blur-sm transition-all placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-white"
        rows={3}
      />

      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="flex animate-pulse items-center gap-1.5 font-medium text-indigo-500">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Saving...
            </span>
          )}
        </div>

        {showCharacterCount && maxLength && (
          <span className="font-medium">
            {(value || '').length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
