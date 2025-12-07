/**
 * TabButton Component - Shared Logic
 *
 * Common types for both web and native tab buttons
 */
export interface TabButtonSharedProps {
    active: boolean;
    onClick: () => void;
    label: string;
    count?: number;
}
