"use client";

import { useEffect, useRef } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    void el.offsetHeight;
    el.style.transition = "opacity 0.38s cubic-bezier(0.22,1,0.36,1), transform 0.38s cubic-bezier(0.22,1,0.36,1)";
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    // Clear transform after animation — a non-none transform creates a containing block
    // for position:fixed children (modals), breaking their viewport-relative positioning
    const t = setTimeout(() => {
      el.style.transition = "";
      el.style.transform = "";
    }, 420);
    return () => {
      clearTimeout(t);
      el.style.transition = "";
      el.style.transform = "";
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
