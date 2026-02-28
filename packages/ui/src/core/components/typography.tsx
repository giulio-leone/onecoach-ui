import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@giulio-leone/lib-design-system';

const typographyVariants = cva('text-neutral-900 dark:text-neutral-100', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 border-b border-neutral-200/60 pb-2 text-3xl font-semibold tracking-tight first:mt-0 dark:border-white/[0.08]',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      blockquote:
        'mt-6 border-l-2 border-neutral-300 pl-6 italic text-neutral-800 dark:border-white/[0.1] dark:text-neutral-200',
      list: 'my-6 ml-6 list-disc [&>li]:mt-2',
      lead: 'text-xl text-neutral-600 dark:text-neutral-400',
      large: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-neutral-500 dark:text-neutral-400',
      error: 'text-sm text-red-500 dark:text-red-400 font-medium',
    },
    weight: {
      default: '',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'p',
    weight: 'default',
    align: 'left',
  },
});

export interface TypographyProps
  extends
    React.HTMLAttributes<
      HTMLHeadingElement | HTMLParagraphElement | HTMLQuoteElement | HTMLUListElement
    >,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, weight, align, as: Component, ...props }, ref) => {
    // Default component mapping based on variant
    const Comp =
      Component ||
      ((variant === 'h1'
        ? 'h1'
        : variant === 'h2'
          ? 'h2'
          : variant === 'h3'
            ? 'h3'
            : variant === 'h4'
              ? 'h4'
              : variant === 'p' ||
                  variant === 'lead' ||
                  variant === 'large' ||
                  variant === 'muted' ||
                  variant === 'error'
                ? 'p'
                : variant === 'blockquote'
                  ? 'blockquote'
                  : variant === 'list'
                    ? 'ul'
                    : 'div') as React.ElementType);

    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants({ variant, weight, align, className }))}
        {...props}
      />
    );
  }
);

Typography.displayName = 'Typography';

// Facade Components for convenience
export const H1 = (props: TypographyProps) => <Typography variant="h1" {...props} />;
export const H2 = (props: TypographyProps) => <Typography variant="h2" {...props} />;
export const H3 = (props: TypographyProps) => <Typography variant="h3" {...props} />;
export const H4 = (props: TypographyProps) => <Typography variant="h4" {...props} />;
export const P = (props: TypographyProps) => <Typography variant="p" {...props} />;
export const Blockquote = (props: TypographyProps) => (
  <Typography variant="blockquote" {...props} />
);
export const List = (props: TypographyProps) => <Typography variant="list" {...props} />;
export const Lead = (props: TypographyProps) => <Typography variant="lead" {...props} />;
export const Large = (props: TypographyProps) => <Typography variant="large" {...props} />;
export const Small = (props: TypographyProps) => <Typography variant="small" {...props} />;
export const Muted = (props: TypographyProps) => <Typography variant="muted" {...props} />;
export const ErrorText = (props: TypographyProps) => <Typography variant="error" {...props} />;
