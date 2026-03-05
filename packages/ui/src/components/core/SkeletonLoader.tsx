'use client';

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  borderRadius?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  className,
}: SkeletonLoaderProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#E5E7EB',
        animation: 'skeleton-pulse 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12 }}>
      <SkeletonLoader width="40%" height={24} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={16} />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {[1, 2, 3, 4].map((i: number) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: '45%',
            backgroundColor: '#FFFFFF',
            padding: 16,
            borderRadius: 12,
          }}
        >
          <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="60%" height={24} style={{ marginBottom: 4 }} />
          <SkeletonLoader width="80%" height={14} />
        </div>
      ))}
    </div>
  );
}

