'use client';

import React from 'react';

interface AnimatedPressableButtonProps {
  children: React.ReactNode;
  hapticFeedback?: boolean;
  scaleValue?: number;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function AnimatedPressableButton({
  children,
  scaleValue = 0.95,
  style,
  className,
  onClick,
  disabled,
}: AnimatedPressableButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const animatedStyle: React.CSSProperties = {
    transform: `scale(${isPressed ? scaleValue : 1})`,
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  return (
    <button
      type="button"
      className={className}
      style={animatedStyle}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

