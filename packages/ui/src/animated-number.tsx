import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@onecoach/lib-design-system';

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

    // Start animation
    // In React Native environment requestAnimationFrame might behave differently than web
    // but standard usage is compatible
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <View className="items-center">
      <View className="flex-row items-baseline">
        <Text className={cn('font-bold tabular-nums', className)}>{format(displayValue)}</Text>
        {suffix && (
          <Text className={cn('ml-1 text-sm font-medium opacity-60', className)}>{suffix}</Text>
        )}
      </View>
      {label && (
        <Text className="mt-1 text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {label}
        </Text>
      )}
    </View>
  );
}
