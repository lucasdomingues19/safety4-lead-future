import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredSectionProps {
  children: ReactNode;
  /** Reserved space before the section mounts, avoids layout jumps. */
  minHeight?: number;
  rootMargin?: string;
}

/**
 * Renders its children only once the placeholder scrolls near the viewport.
 * Used to defer below-the-fold homepage sections so the initial page load
 * ships less JavaScript without changing any content or behaviour.
 */
export const DeferredSection = ({
  children,
  minHeight = 400,
  rootMargin = "600px",
}: DeferredSectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
};
