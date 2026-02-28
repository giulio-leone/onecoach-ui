/**
 * Typography Components
 *
 * Design system typography components following SOLID and DRY principles.
 * Mobile-first, responsive, and optimized for dark mode.
 */

import React from 'react';
import { cn, darkModeClasses } from '@giulio-leone/lib-design-system';

// ============================================================================
// HEADING COMPONENT
// ============================================================================

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level (h1-h6)
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Visual size variant (can differ from semantic level)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  /**
   * Font weight
   */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand';
  /**
   * Adds gradient text effect
   */
  gradient?: boolean;
  /**
   * Truncate text with ellipsis
   */
  truncate?: boolean;
  children: React.ReactNode;
}

const headingSizeStyles = {
  xs: 'text-xs leading-4',
  sm: 'text-sm leading-5',
  md: 'text-base leading-6',
  lg: 'text-lg leading-7',
  xl: 'text-xl leading-7',
  '2xl': 'text-2xl leading-8 sm:text-3xl sm:leading-9',
  '3xl': 'text-3xl leading-9 sm:text-4xl sm:leading-10',
  '4xl': 'text-4xl leading-10 sm:text-5xl sm:leading-none',
  '5xl': 'text-5xl leading-none sm:text-6xl',
  '6xl': 'text-6xl leading-none sm:text-7xl',
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

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
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
      children,
      ...props
    },
    ref
  ) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

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
      gradient &&
        'bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent',
      truncate && 'truncate',
      'transition-colors duration-200',
      className
    );

    return (
      <Tag
        ref={ref as React.LegacyRef<HTMLHeadingElement>}
        className={classes}
        {...(props as React.HTMLAttributes<HTMLHeadingElement>)}
      >
        {children}
      </Tag>
    );
  }
);

Heading.displayName = 'Heading';

// ============================================================================
// TEXT COMPONENT
// ============================================================================

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * HTML element to render
   */
  as?: 'p' | 'span' | 'div' | 'label' | 'small' | 'strong' | 'em';
  /**
   * Text size
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  /**
   * Font weight
   */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  /**
   * Color variant
   */
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
  /**
   * Truncate text with ellipsis
   */
  truncate?: boolean;
  /**
   * Line clamp (max lines before truncating)
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * React Native compatibility prop for line clamping
   */
  numberOfLines?: number;
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
  link: cn(
    darkModeClasses.text.link,
    darkModeClasses.text.linkHover,
    'underline-offset-2 hover:underline cursor-pointer'
  ),
  success: darkModeClasses.semantic.success.text,
  warning: darkModeClasses.semantic.warning.text,
  error: darkModeClasses.semantic.error.text,
  info: darkModeClasses.semantic.info.text,
};

const lineClampStyles = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = 'p',
      size = 'base',
      weight = 'normal',
      align = 'left',
      variant = 'primary',
      truncate = false,
      lineClamp,
      numberOfLines,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Compute clampValue with proper type narrowing
    const clampValue = (lineClamp ?? numberOfLines) as 1 | 2 | 3 | 4 | 5 | 6 | undefined;

    const classes = cn(
      textSizeStyles[size],
      textWeightStyles[weight],
      textAlignStyles[align],
      textVariantStyles[variant],
      truncate && 'truncate',
      clampValue && lineClampStyles[clampValue],
      'transition-colors duration-200',
      className
    );

    type ComponentProps = React.HTMLAttributes<
      HTMLParagraphElement | HTMLSpanElement | HTMLDivElement | HTMLLabelElement | HTMLElement
    >;
    return React.createElement(
      Component,
      {
        ref,
        className: classes,
        ...(props as ComponentProps),
      },
      children
    );
  }
);

Text.displayName = 'Text';

// ============================================================================
// LABEL COMPONENT
// ============================================================================

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Label size
   */
  size?: 'sm' | 'base' | 'lg';
  /**
   * Font weight
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /**
   * Whether this label is for a required field
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  children: React.ReactNode;
}

const labelSizeStyles = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      size = 'base',
      weight = 'medium',
      required = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'block mb-1.5',
      labelSizeStyles[size],
      textWeightStyles[weight],
      disabled
        ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
        : 'text-neutral-700 dark:text-neutral-300',
      'transition-colors duration-200',
      className
    );

    return (
      <label ref={ref} className={classes} {...props}>
        {children}
        {required && (
          <span className="ml-1 text-red-600 dark:text-red-400" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

// ============================================================================
// HELPER TEXT COMPONENT
// ============================================================================

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Variant for different states
   */
  variant?: 'default' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
}

const helperTextVariantStyles = {
  default: 'text-neutral-500 dark:text-neutral-500',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
};

export const HelperText = React.forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const classes = cn(
      'mt-1.5 text-xs leading-4',
      helperTextVariantStyles[variant],
      'transition-colors duration-200',
      className
    );

    return (
      <p ref={ref} className={classes} {...props}>
        {children}
      </p>
    );
  }
);

HelperText.displayName = 'HelperText';

// ============================================================================
// CODE COMPONENT
// ============================================================================

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Whether to render as a block or inline
   */
  block?: boolean;
  /**
   * Language for syntax highlighting context
   */
  language?: string;
  children: React.ReactNode;
}

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ block = false, language, className, children, ...props }, ref) => {
    if (block) {
      return (
        <pre
          ref={ref as React.LegacyRef<HTMLPreElement>}
          className={cn(
            'overflow-x-auto rounded-lg p-4',
            'bg-neutral-100 dark:bg-white/[0.04]',
            'border border-neutral-200 dark:border-white/[0.08]',
            'font-mono text-sm',
            'text-neutral-900 dark:text-neutral-100',
            className
          )}
          {...props}
        >
          <code data-language={language}>{children}</code>
        </pre>
      );
    }

    return (
      <code
        ref={ref as React.LegacyRef<HTMLElement>}
        className={cn(
          'rounded px-1.5 py-0.5',
          'bg-neutral-100 dark:bg-white/[0.04]',
          'border border-neutral-200 dark:border-white/[0.08]',
          'font-mono text-sm',
          'text-neutral-900 dark:text-neutral-100',
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }
);

Code.displayName = 'Code';
