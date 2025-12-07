/**
 * Memory Editor Component
 *
 * Editor for user memory with CRUD operations.
 * KISS: Simple form-based editor
 * SOLID: Single responsibility - only editing
 */
import type { MemoryDomain } from '@OneCoach/lib-core/user-memory/types';
export interface MemoryEditorProps {
    userId: string;
    domain: MemoryDomain;
    onSave?: () => void;
    className?: string;
}
export declare function MemoryEditor({ userId, domain, onSave, className }: MemoryEditorProps): import("react/jsx-runtime").JSX.Element;
