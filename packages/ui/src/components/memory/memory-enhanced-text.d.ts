/**
 * Memory Enhanced Text Component
 *
 * Component for enhancing text using AI.
 * KISS: Simple textarea with enhance button
 */
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
export declare function MemoryEnhancedText({ value, onChange, onEnhanced, placeholder, context, domain, className, disabled, }: MemoryEnhancedTextProps): import("react/jsx-runtime").JSX.Element;
