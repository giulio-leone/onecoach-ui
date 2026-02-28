/**
 * Animation Utilities — Glass Morphism Premium
 *
 * Centralized animation classes for consistent motion language.
 * Reduced motion support built in.
 */

export const animations = {
  // Fade animations
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',

  // Slide animations
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',

  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',

  // Glass-specific animations
  glassReveal: 'animate-glass-reveal',
  glowPulse: 'animate-glow-pulse',
  shimmer: 'animate-shimmer',
  float: 'animate-float',

  // Transition durations
  duration: {
    instant: 'duration-75',
    fast: 'duration-150',
    base: 'duration-200',
    medium: 'duration-300',
    slow: 'duration-500',
    slower: 'duration-700',
  },

  // Transition timing functions
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Common transition combinations
  transitions: {
    all: 'transition-all duration-200 ease-in-out',
    colors: 'transition-colors duration-200',
    opacity: 'transition-opacity duration-200',
    transform: 'transition-transform duration-200 ease-out',
    shadow: 'transition-shadow duration-200',
    glass: 'transition-all duration-300 cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Hover effect presets
  hover: {
    lift: 'hover:-translate-y-0.5 transition-transform duration-200',
    glow: 'hover:shadow-glow transition-shadow duration-300',
    scale: 'hover:scale-[1.02] transition-transform duration-200',
    brighten: 'hover:brightness-110 transition-all duration-200',
  },
} as const;

/**
 * Get animation class with reduced motion support
 */
export function getAnimation(animation: keyof typeof animations): string {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return 'transition-opacity duration-200';
    }
  }
  return animations[animation] as string;
}
