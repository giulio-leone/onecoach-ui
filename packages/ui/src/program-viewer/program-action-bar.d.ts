export interface ProgramActionBarProps {
    onBack: () => void;
    onTrack?: () => void;
    onDelete?: () => void;
    trackLabel?: string;
    deleteLabel?: string;
    variant?: 'workout' | 'nutrition';
    className?: string;
}
export declare function ProgramActionBar({ onBack, onTrack, onDelete, trackLabel, deleteLabel, variant, className, }: ProgramActionBarProps): import("react/jsx-runtime").JSX.Element;
