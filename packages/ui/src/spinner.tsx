/**
 * Spinner Component
 *
 * Componente per indicatori di caricamento
 */

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'neutral' | 'white';
  className?: string;
}

export const Spinner = ({ size = 'md', variant = 'primary', className = '' }: SpinnerProps) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const variantStyles = {
    primary:
      'border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400',
    secondary:
      'border-secondary-200 dark:border-secondary-900 border-t-secondary-600 dark:border-t-secondary-400',
    neutral:
      'border-neutral-200/60 dark:border-white/[0.08] border-t-neutral-600 dark:border-t-neutral-300',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loader
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm dark:bg-neutral-900/80">
      <div className="text-center">
        <Spinner size="xl" variant="primary" />
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
      </div>
    </div>
  );
};
