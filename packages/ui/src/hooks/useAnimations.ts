'use client';

/**
 * Web version of animation hooks using CSS transitions
 */

import { useEffect, useState, useCallback } from 'react';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  damping?: number;
  stiffness?: number;
}

/**
 * Fade in animation hook for web
 */
export function useFadeIn(config: AnimationConfig = {}) {
  const { duration = 300, delay = 0 } = config;
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = {
    opacity,
    transition: `opacity ${duration}ms ease-in-out`,
  };

  return { animatedStyle, opacity: { value: opacity } };
}

/**
 * Slide in animation hook for web
 */
export function useSlideIn(
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  config: AnimationConfig = {}
) {
  const { duration = 300, delay = 0 } = config;
  const [translateX, setTranslateX] = useState(
    direction === 'left' ? -50 : direction === 'right' ? 50 : 0
  );
  const [translateY, setTranslateY] = useState(
    direction === 'up' ? -50 : direction === 'down' ? 50 : 0
  );
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTranslateX(0);
      setTranslateY(0);
      setOpacity(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = {
    transform: `translate(${translateX}px, ${translateY}px)`,
    opacity,
    transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
  };

  return {
    animatedStyle,
    translateX: { value: translateX },
    translateY: { value: translateY },
    opacity: { value: opacity },
  };
}

/**
 * Scale in animation hook for web
 */
export function useScaleIn(config: AnimationConfig = {}) {
  const { delay = 0, damping = 15, stiffness = 150 } = config;
  const [scale, setScale] = useState(0.8);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScale(1);
      setOpacity(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const duration = Math.max(200, Math.sqrt(stiffness / damping) * 100);

  const animatedStyle = {
    transform: `scale(${scale})`,
    opacity,
    transition: `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out`,
  };

  return { animatedStyle, scale: { value: scale }, opacity: { value: opacity } };
}

/**
 * Bounce animation hook for web
 */
export function useBounce() {
  const [scale, setScale] = useState(1);

  const bounce = useCallback(() => {
    setScale(0.95);
    setTimeout(() => setScale(1), 100);
  }, []);

  const animatedStyle = {
    transform: `scale(${scale})`,
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return { animatedStyle, bounce };
}

/**
 * Staggered fade in animation hook for web
 */
export function useStaggeredFadeIn(index: number, config: AnimationConfig = {}) {
  const { duration = 300, delay = 50 } = config;
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(20);

  useEffect(() => {
    const itemDelay = index * delay;
    const timer = setTimeout(() => {
      setOpacity(1);
      setTranslateY(0);
    }, itemDelay);

    return () => clearTimeout(timer);
  }, [index, delay]);

  const animatedStyle = {
    opacity,
    transform: `translateY(${translateY}px)`,
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
  };

  return {
    animatedStyle,
    opacity: { value: opacity },
    translateY: { value: translateY },
  };
}

/**
 * Shimmer loading animation hook for web
 */
export function useShimmer(duration: number = 1500) {
  const [translateX, setTranslateX] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslateX((prev) => (prev === 1 ? -1 : 1));
    }, duration);

    return () => clearInterval(interval);
  }, [duration]);

  const animatedStyle = {
    transform: `translateX(${translateX * 100}%)`,
    transition: `transform ${duration}ms linear`,
  };

  return { animatedStyle, translateX: { value: translateX } };
}

/**
 * Rotation animation hook for web
 */
export function useRotate(config: AnimationConfig = {}) {
  const { duration = 1000 } = config;
  const [rotation, setRotation] = useState(0);

  const rotate = useCallback(() => {
    setRotation(360);
    setTimeout(() => setRotation(0), duration);
  }, [duration]);

  const animatedStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: `transform ${duration}ms ease-in-out`,
  };

  return { animatedStyle, rotate, rotation: { value: rotation } };
}

/**
 * Pulse animation hook for web
 */
export function usePulse(config: AnimationConfig = {}) {
  const { duration = 1000 } = config;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(1.05);
      setTimeout(() => setScale(1), duration / 2);
    }, duration);

    return () => clearInterval(interval);
  }, [duration]);

  const animatedStyle = {
    transform: `scale(${scale})`,
    transition: `transform ${duration / 2}ms ease-in-out`,
  };

  return { animatedStyle, scale: { value: scale } };
}
