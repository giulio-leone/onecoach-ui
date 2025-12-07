import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TextInput } from 'react-native';
import { cn } from '@onecoach/lib-design-system';
export function FormInput({ label, error, icon, containerClassName, className, ...props }) {
    return (_jsxs(View, { className: cn('space-y-2', containerClassName), children: [label && (_jsx(Text, { className: "text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400", children: label })), _jsxs(View, { className: cn('flex-row items-center rounded-2xl border bg-neutral-50 px-4 py-3 transition-colors dark:bg-neutral-800/50', error
                    ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                    : 'border-neutral-200 focus:border-blue-500 dark:border-neutral-700 dark:focus:border-blue-400'), children: [icon && _jsx(View, { className: "mr-3 text-neutral-400", children: icon }), _jsx(TextInput, { className: cn('flex-1 bg-transparent text-base font-medium text-neutral-900 placeholder:text-neutral-400 dark:text-white', className), placeholderTextColor: "#9CA3AF", ...props })] }), error && _jsx(Text, { className: "text-xs font-medium text-red-500 dark:text-red-400", children: error })] }));
}
