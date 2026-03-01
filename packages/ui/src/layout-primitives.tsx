/**
 * Layout Components
 *
 * Design system layout components following SOLID and DRY principles.
 * Mobile-first, responsive, and optimized for dark mode.
 * Provides: Container, Grid, Stack, Flex, Box, Divider, Spacer
 */

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width variant
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /**
   * Center the container
   */
  center?: boolean;
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const containerMaxWidthStyles = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-[1920px]',
  '4xl': 'max-w-[2048px]',
  '5xl': 'max-w-[2560px]',
  '6xl': 'max-w-[3072px]',
  '7xl': 'max-w-[3840px]',
  full: 'max-w-full',
};

const containerPaddingStyles = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-4 sm:px-8 lg:px-12',
  xl: 'px-4 sm:px-8 lg:px-16',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxWidth = 'xl', center = true, padding = 'md', className, children, ...props }, ref) => {
    const classes = cn(
      'w-full',
      containerMaxWidthStyles[maxWidth],
      center && 'mx-auto',
      containerPaddingStyles[padding],
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

// ============================================================================
// GRID COMPONENT
// ============================================================================

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns (responsive)
   */
  cols?: {
    default?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  };
  /**
   * Gap between grid items
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Align items
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /**
   * Justify items
   */
  justify?: 'start' | 'center' | 'end' | 'stretch';
  children: React.ReactNode;
}

const gridColsStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const gridGapStyles = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
};

const gridAlignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const gridJustifyStyles = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { cols, gap = 'md', align = 'stretch', justify = 'stretch', className, children, ...props },
    ref
  ) => {
    const classes = cn(
      'grid',
      cols?.default && gridColsStyles[cols.default],
      cols?.sm && `sm:${gridColsStyles[cols.sm]}`,
      cols?.md && `md:${gridColsStyles[cols.md]}`,
      cols?.lg && `lg:${gridColsStyles[cols.lg]}`,
      cols?.xl && `xl:${gridColsStyles[cols.xl]}`,
      gridGapStyles[gap],
      gridAlignStyles[align],
      gridJustifyStyles[justify],
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// ============================================================================
// STACK COMPONENT (Vertical/Horizontal)
// ============================================================================

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction of stack
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * Spacing between items
   */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Align items
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /**
   * Justify content
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /**
   * Wrap items
   */
  wrap?: boolean;
  /**
   * Responsive direction change
   */
  responsive?: {
    sm?: 'vertical' | 'horizontal';
    md?: 'vertical' | 'horizontal';
    lg?: 'vertical' | 'horizontal';
  };
  children: React.ReactNode;
}

const stackSpacingStyles = {
  vertical: {
    none: 'space-y-0',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12',
  },
  horizontal: {
    none: 'space-x-0',
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
    '2xl': 'space-x-12',
  },
};

const stackAlignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const stackJustifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'vertical',
      spacing = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      responsive,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'flex',
      direction === 'vertical' ? 'flex-col' : 'flex-row',
      responsive?.sm && (responsive.sm === 'vertical' ? 'sm:flex-col' : 'sm:flex-row'),
      responsive?.md && (responsive.md === 'vertical' ? 'md:flex-col' : 'md:flex-row'),
      responsive?.lg && (responsive.lg === 'vertical' ? 'lg:flex-col' : 'lg:flex-row'),
      stackSpacingStyles[direction][spacing],
      stackAlignStyles[align],
      stackJustifyStyles[justify],
      wrap && 'flex-wrap',
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// Convenience aliases
export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="vertical" {...props} />
);

VStack.displayName = 'VStack';

export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="horizontal" {...props} />
);

HStack.displayName = 'HStack';

// ============================================================================
// FLEX COMPONENT
// ============================================================================

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Flex direction
   */
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  /**
   * Align items
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /**
   * Justify content
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /**
   * Flex wrap
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /**
   * Gap between items
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const flexDirectionStyles = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

const flexAlignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const flexJustifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const flexWrapStyles = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const flexGapStyles = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      align = 'stretch',
      justify = 'start',
      wrap = 'nowrap',
      gap = 'none',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'flex',
      flexDirectionStyles[direction],
      flexAlignStyles[align],
      flexJustifyStyles[justify],
      flexWrapStyles[wrap],
      flexGapStyles[gap],
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

// ============================================================================
// BOX COMPONENT
// ============================================================================

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * HTML element to render
   */
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';
  /**
   * Padding
   */
  p?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Margin
   */
  m?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const boxPaddingStyles = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

const boxMarginStyles = {
  none: 'm-0',
  xs: 'm-2',
  sm: 'm-4',
  md: 'm-6',
  lg: 'm-8',
  xl: 'm-12',
};

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  ({ as: Component = 'div', p, m, className, children, ...props }, ref) => {
    const classes = cn(p && boxPaddingStyles[p], m && boxMarginStyles[m], className);

    return React.createElement(
      Component,
      {
        ref,
        className: classes,
        ...(props as React.HTMLAttributes<HTMLElement>),
      },
      children
    );
  }
);

Box.displayName = 'Box';

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Thickness
   */
  thickness?: 'thin' | 'medium' | 'thick';
  /**
   * Spacing around divider
   */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Color variant
   */
  variant?: 'default' | 'strong' | 'subtle';
}

const dividerThicknessStyles = {
  horizontal: {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1',
  },
  vertical: {
    thin: 'w-px',
    medium: 'w-0.5',
    thick: 'w-1',
  },
};

const dividerSpacingStyles = {
  horizontal: {
    none: '',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
  },
  vertical: {
    none: '',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
  },
};

const dividerVariantStyles = {
  default: 'bg-neutral-200 dark:bg-white/[0.08]',
  strong: 'bg-neutral-300 dark:bg-white/[0.10]',
  subtle: 'bg-neutral-100 dark:bg-white/[0.04]',
};

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      thickness = 'thin',
      spacing = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'border-0',
      orientation === 'horizontal' ? 'w-full' : 'h-full',
      dividerThicknessStyles[orientation][thickness],
      dividerSpacingStyles[orientation][spacing],
      dividerVariantStyles[variant],
      className
    );

    return <hr ref={ref} className={classes} {...props} />;
  }
);

Divider.displayName = 'Divider';

// ============================================================================
// SEPARATOR COMPONENT (Divider with text)
// ============================================================================

export interface LayoutSeparatorProps {
  /**
   * Text to display in the center
   */
  text?: string;
  /**
   * React node to display in the center (alternative to text)
   */
  children?: React.ReactNode;
  /**
   * Spacing around separator
   */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Color variant
   */
  variant?: 'default' | 'strong' | 'subtle' | 'elegant';
  /**
   * Additional className
   */
  className?: string;
}

const separatorSpacingStyles = {
  none: '',
  sm: 'my-3',
  md: 'my-5',
  lg: 'my-7',
};

const separatorVariantStyles = {
  default: {
    line: 'bg-neutral-200 dark:bg-white/[0.08]',
    text: 'text-neutral-500 dark:text-neutral-400',
  },
  strong: {
    line: 'bg-neutral-300 dark:bg-white/[0.10]',
    text: 'text-neutral-600 dark:text-neutral-300',
  },
  subtle: {
    line: 'bg-neutral-100 dark:bg-white/[0.04]',
    text: 'text-neutral-400 dark:text-neutral-500',
  },
  elegant: {
    line: 'bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-600',
    text: 'text-neutral-500 dark:text-neutral-400',
  },
};

export const LayoutSeparator: React.FC<LayoutSeparatorProps> = ({
  text,
  children,
  spacing = 'md',
  variant = 'default',
  className = '',
}) => {
  const styles = separatorVariantStyles[variant];
  const content = children || text;

  return (
    <div
      className={cn('relative flex items-center gap-4', separatorSpacingStyles[spacing], className)}
      role="separator"
      aria-orientation="horizontal"
    >
      <div
        className={cn('h-px flex-1 transition-colors duration-200', styles.line)}
        aria-hidden="true"
      />
      {content && (
        <span
          className={cn(
            'shrink-0 px-4 text-xs font-medium tracking-wide uppercase',
            'transition-colors duration-200 select-none',
            styles.text
          )}
        >
          {content}
        </span>
      )}
      <div
        className={cn('h-px flex-1 transition-colors duration-200', styles.line)}
        aria-hidden="true"
      />
    </div>
  );
};

// LayoutSeparator.displayName = 'LayoutSeparator';

// ============================================================================
// SPACER COMPONENT
// ============================================================================

export interface SpacerProps {
  /**
   * Size of spacer
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /**
   * Direction
   */
  direction?: 'vertical' | 'horizontal';
}

const spacerSizeStyles = {
  vertical: {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16',
    '3xl': 'h-24',
  },
  horizontal: {
    xs: 'w-2',
    sm: 'w-4',
    md: 'w-6',
    lg: 'w-8',
    xl: 'w-12',
    '2xl': 'w-16',
    '3xl': 'w-24',
  },
};

export const Spacer: React.FC<SpacerProps> = ({ size = 'md', direction = 'vertical' }) => {
  return <div className={spacerSizeStyles[direction][size]} aria-hidden="true" />;
};

Spacer.displayName = 'Spacer';
