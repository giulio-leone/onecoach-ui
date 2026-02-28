/**
 * Typography Components - React Native
 *
 * Design system typography components for React Native
 * Cross-platform compatible with web version using NativeWind
 */

import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn, darkModeClasses } from '@giulio-leone/lib-design-system';

// ============================================================================
// HEADING COMPONENT
// ============================================================================

export interface HeadingProps extends RNTextProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand';
  gradient?: boolean;
  truncate?: boolean;
  className?: string;
  children: React.ReactNode;
}

const headingSizeStyles = {
  xs: 'text-xs leading-4',
  sm: 'text-sm leading-5',
  md: 'text-base leading-6',
  lg: 'text-lg leading-7',
  xl: 'text-xl leading-7',
  '2xl': 'text-2xl leading-8',
  '3xl': 'text-3xl leading-9',
  '4xl': 'text-4xl leading-10',
  '5xl': 'text-5xl leading-none',
  '6xl': 'text-6xl leading-none',
};

const headingWeightStyles = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const headingAlignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const headingVariantStyles = {
  primary: 'text-neutral-900 dark:text-neutral-50',
  secondary: 'text-neutral-700 dark:text-neutral-300',
  tertiary: 'text-neutral-600 dark:text-neutral-400',
  inverse: 'text-white dark:text-neutral-900',
  brand: 'text-primary-600 dark:text-primary-400',
};

export const Heading = React.forwardRef<RNText, HeadingProps>(
  (
    {
      level = 2,
      size,
      weight = 'bold',
      align = 'left',
      variant = 'primary',
      gradient = false,
      truncate = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    // Default size based on level if not specified
    const defaultSizes: Record<number, keyof typeof headingSizeStyles> = {
      1: '4xl',
      2: '3xl',
      3: '2xl',
      4: 'xl',
      5: 'lg',
      6: 'md',
    };

    const effectiveSize = (size || defaultSizes[level]) ?? 'md';

    const classes = cn(
      headingSizeStyles[effectiveSize],
      headingWeightStyles[weight],
      headingAlignStyles[align],
      !gradient && headingVariantStyles[variant],
      // Valid NativeWind gradient support depends on specific setup,
      // but usually requires a View wrapper or MaskedView for text gradients.
      // For now, we mimic the web intent with color fallback if gradient isn't directly supported on Text.
      // If we need true gradients, we should implement a specific GradientText component.
      gradient && 'text-primary-600 dark:text-primary-400',
      className
    );

    return (
      <RNText
        ref={ref}
        className={classes}
        style={style}
        numberOfLines={truncate ? 1 : undefined}
        ellipsizeMode={truncate ? 'tail' : undefined}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Heading.displayName = 'Heading';

// ============================================================================
// TEXT COMPONENT
// ============================================================================

export interface TextProps extends RNTextProps {
  as?: 'p' | 'span' | 'div' | 'label' | 'small' | 'strong' | 'em'; // Ignored in Native but kept for compat
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  variant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'muted'
    | 'inverse'
    | 'link'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';
  truncate?: boolean;
  lineClamp?: number;
  className?: string;
  children: React.ReactNode;
}

const textSizeStyles = {
  xs: 'text-xs leading-4',
  sm: 'text-sm leading-5',
  base: 'text-base leading-6',
  lg: 'text-lg leading-7',
  xl: 'text-xl leading-8',
};

const textWeightStyles = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textAlignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const textVariantStyles = {
  primary: darkModeClasses.text.primary,
  secondary: darkModeClasses.text.secondary,
  tertiary: darkModeClasses.text.tertiary,
  muted: darkModeClasses.text.muted,
  inverse: darkModeClasses.text.inverse,
  link: 'text-primary-600 dark:text-primary-400 underline', // Simplified link for native
  success: darkModeClasses.semantic.success.text,
  warning: darkModeClasses.semantic.warning.text,
  error: darkModeClasses.semantic.error.text,
  info: darkModeClasses.semantic.info.text,
};

export const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      size = 'base',
      weight = 'normal',
      align = 'left',
      variant = 'primary',
      truncate = false,
      lineClamp,
      className,
      style,
      children,
      numberOfLines, // Native prop
      ...props
    },
    ref
  ) => {
    const classes = cn(
      textSizeStyles[size],
      textWeightStyles[weight],
      textAlignStyles[align],
      textVariantStyles[variant],
      className
    );

    const effectiveNumberOfLines = truncate ? 1 : (lineClamp ?? numberOfLines);

    return (
      <RNText
        ref={ref}
        className={classes}
        style={style}
        numberOfLines={effectiveNumberOfLines}
        ellipsizeMode={effectiveNumberOfLines ? 'tail' : undefined}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';

// ============================================================================
// LABEL COMPONENT
// ============================================================================

export interface LabelProps extends RNTextProps {
  size?: 'sm' | 'base' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const labelSizeStyles = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
};

export const Label = React.forwardRef<RNText, LabelProps>(
  (
    {
      size = 'base',
      weight = 'medium',
      required = false,
      disabled = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'mb-1.5',
      labelSizeStyles[size],
      textWeightStyles[weight],
      disabled
        ? 'text-neutral-400 dark:text-neutral-600'
        : 'text-neutral-700 dark:text-neutral-300',
      className
    );

    return (
      <RNText ref={ref} className={classes} style={style} {...props}>
        {children}
        {required && <RNText className="ml-1 text-red-600 dark:text-red-400">*</RNText>}
      </RNText>
    );
  }
);

Label.displayName = 'Label';

// ============================================================================
// HELPER TEXT COMPONENT
// ============================================================================

export interface HelperTextProps extends RNTextProps {
  variant?: 'default' | 'error' | 'success' | 'warning';
  className?: string;
  children: React.ReactNode;
}

const helperTextVariantStyles = {
  default: 'text-neutral-500 dark:text-neutral-500',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
};

export const HelperText = React.forwardRef<RNText, HelperTextProps>(
  ({ variant = 'default', className, style, children, ...props }, ref) => {
    const classes = cn('mt-1.5 text-xs leading-4', helperTextVariantStyles[variant], className);

    return (
      <RNText ref={ref} className={classes} style={style} {...props}>
        {children}
      </RNText>
    );
  }
);

HelperText.displayName = 'HelperText';

// ============================================================================
// CODE COMPONENT
// ============================================================================

export interface CodeProps extends RNTextProps {
  block?: boolean;
  language?: string; // Ignored in native simple text
  className?: string;
  children: React.ReactNode;
}

export const Code = React.forwardRef<RNText, CodeProps>(
  ({ block = false, language, className, style, children, ...props }, ref) => {
    const classes = cn(
      'font-mono text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08]',
      block ? 'rounded-lg p-4' : 'rounded px-1.5 py-0.5',
      className
    );

    return (
      <RNText ref={ref} className={classes} style={style} {...props}>
        {children}
      </RNText>
    );
  }
);

Code.displayName = 'Code';
