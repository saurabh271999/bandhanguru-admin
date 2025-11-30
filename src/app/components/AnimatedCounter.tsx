"use client";

import React, { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  className = "",
  prefix = "",
  suffix = "",
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true);
      const startValue = prevValueRef.current;
      const endValue = value;
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          prevValueRef.current = value;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, duration]);

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export default AnimatedCounter;
