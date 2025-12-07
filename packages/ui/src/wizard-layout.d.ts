export interface WizardStep {
    id: string;
    title: string;
    description?: string;
    component: React.ReactNode;
    isValid?: boolean;
}
interface WizardLayoutProps {
    steps: WizardStep[];
    currentStepIndex: number;
    onStepChange: (index: number) => void;
    onComplete: () => void;
    isCompleting?: boolean;
    title?: string;
    subtitle?: string;
    className?: string;
}
export declare function WizardLayout({ steps, currentStepIndex, onStepChange, onComplete, isCompleting, title, subtitle, className, }: WizardLayoutProps): import("react/jsx-runtime").JSX.Element | null;
export {};
