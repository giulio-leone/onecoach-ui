import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Spinner = ({ size = 'md', variant = 'primary', className = '' }) => {
    const sizeStyles = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
        xl: 'w-12 h-12 border-4',
    };
    const variantStyles = {
        primary: 'border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400',
        secondary: 'border-secondary-200 dark:border-secondary-900 border-t-secondary-600 dark:border-t-secondary-400',
        neutral: 'border-neutral-200 dark:border-neutral-700 border-t-neutral-600 dark:border-t-neutral-300',
        white: 'border-white/20 border-t-white',
    };
    return (_jsx("div", { className: `inline-block animate-spin rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`, role: "status", "aria-label": "Loading", children: _jsx("span", { className: "sr-only", children: "Loading..." }) }));
};
// Full page loader
export const PageLoader = () => {
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm dark:bg-neutral-900/80", children: _jsxs("div", { className: "text-center", children: [_jsx(Spinner, { size: "xl", variant: "primary" }), _jsx("p", { className: "mt-4 text-sm text-neutral-600 dark:text-neutral-400", children: "Loading..." })] }) }));
};
