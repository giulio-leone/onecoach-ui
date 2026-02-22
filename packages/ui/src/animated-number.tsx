import { useEffect, useState } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
  className?: string;
  label?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  format = (v) => Math.round(v).toString(),
  className,
  label,
  suffix,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(value * easeOut);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-baseline">
        <span className={cn('font-bold tabular-nums', className)}>{format(displayValue)}</span>
        {suffix && (
          <span className={cn('ml-1 text-sm font-medium opacity-60', className)}>{suffix}</span>
        )}
      </div>
      {label && (
        <span className="mt-1 text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {label}
        </span>
      )}
    </div>
  );
}
