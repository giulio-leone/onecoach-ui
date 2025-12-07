/**
 * EditorHeader Component
 *
 * Generic header component for visual builders (workout and nutrition)
 * Supports name, description editing and action buttons
 * Fully optimized for dark mode
 */
export interface EditorHeaderProps {
    name: string;
    description: string;
    onNameChange: (name: string) => void;
    onDescriptionChange: (description: string) => void;
    onSave: () => void;
    isSaving: boolean;
    isEditMode: boolean;
    showVersions: boolean;
    onToggleVersions: () => void;
    saveButtonText?: string;
    saveButtonVariant?: 'blue' | 'green';
    className?: string;
}
export declare function EditorHeader({ name, description, onNameChange, onDescriptionChange, onSave, isSaving, isEditMode, showVersions: _showVersions, onToggleVersions, saveButtonText, saveButtonVariant, className, }: EditorHeaderProps): import("react/jsx-runtime").JSX.Element;
