'use client';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonLoaderProps) {
  return (
    <div
      className="animate-pulse bg-neutral-200 dark:bg-neutral-700"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
      <SkeletonLoader height={16} width="60%" />
      <SkeletonLoader height={12} width="80%" />
      <SkeletonLoader height={12} width="40%" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} height={48} borderRadius={8} />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2 rounded-lg border p-4">
          <SkeletonLoader height={12} width="50%" />
          <SkeletonLoader height={24} width="70%" />
        </div>
      ))}
    </div>
  );
}
