import { useEffect, useRef, useState } from "react";

interface CountingNumberProps {
  target: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const CountingNumber = ({
  target,
  duration = 2000,
  suffix = "",
  className = "",
}: CountingNumberProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startTime = Date.now();
    countRef.current = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      countRef.current = Math.floor(target * progress);
      setCount(countRef.current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration]);

  return (
    <span className={className}>
      {count}
      {suffix}
    </span>
  );
};
