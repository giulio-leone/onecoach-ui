/**
 * Memory Enhanced Text Component
 *
 * Component for enhancing text using AI.
 * KISS: Simple textarea with enhance button
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Button } from '../../button';
import { Textarea } from '../../textarea';
import { Sparkles } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export function MemoryEnhancedText({ value, onChange, onEnhanced, placeholder, context, domain, className, disabled, }) {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState(null);
    const handleEnhance = async () => {
        if (!value.trim())
            return;
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il miglioramento');
        }
        finally {
            setIsEnhancing(false);
        }
    };
    return (_jsxs("div", { className: cn('space-y-2', className), children: [_jsxs("div", { className: "relative", children: [_jsx(Textarea, { value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder, disabled: disabled || isEnhancing, className: "min-h-[100px] pr-20" }), value.trim() && (_jsx(Button, { variant: "ghost", size: "sm", icon: Sparkles, iconOnly: true, onClick: handleEnhance, disabled: disabled || isEnhancing, className: "absolute right-2 bottom-2", title: "Migliora con AI" }))] }), error && _jsx("p", { className: "text-xs text-red-500 dark:text-red-400", children: error }), isEnhancing && (_jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "Miglioramento in corso..." }))] }));
}
