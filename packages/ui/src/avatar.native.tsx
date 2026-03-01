import { useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { cn } from '@giulio-leone/lib-design-system';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  bordered?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-24 w-24',
};

const textClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl',
};

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  bordered = false,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <View
      className={cn(
        'relative overflow-hidden rounded-full bg-neutral-100 dark:bg-white/[0.04]',
        sizeClasses[size],
        bordered && 'border-2 border-indigo-500 dark:border-indigo-400',
        className
      )}
    >
      {src && !imageError ? (
        <Image
          source={{ uri: src }}
          alt={alt || fallback}
          className="h-full w-full"
          contentFit="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text
            className={cn(
              'font-medium text-neutral-600 uppercase dark:text-neutral-300',
              textClasses[size]
            )}
          >
            {fallback.slice(0, 2)}
          </Text>
        </View>
      )}
    </View>
  );
}
