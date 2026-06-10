import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export function AdminTableShell({ className, children, topScrollbar = false }) {
  const topScrollRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  const syncScroll = useCallback((source, target) => {
    if (target.current) {
      target.current.scrollLeft = source.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    if (!topScrollbar || !containerRef.current) return;

    const el = containerRef.current;

    const updateWidth = () => {
      setScrollWidth(el.scrollWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);

    return () => observer.disconnect();
  }, [topScrollbar]);

  const shellClass =
    "border-[length:var(--admin-table-border-width)] border-[color:var(--admin-table-border-color)] bg-[color:var(--admin-table-bg)]";

  return (
    <div>
      {topScrollbar && (
        <div
          ref={topScrollRef}
          className={cn(
            "overflow-x-auto overflow-y-hidden rounded-t-[var(--admin-table-radius)] border-b-0",
            shellClass,
          )}
          onScroll={() => syncScroll(topScrollRef, containerRef)}
        >
          <div style={{ width: scrollWidth || "100%", height: 16 }} />
        </div>
      )}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-x-auto overflow-y-hidden",
          topScrollbar
            ? "rounded-b-[var(--admin-table-radius)] border-t-0"
            : "rounded-[var(--admin-table-radius)]",
          shellClass,
          className,
        )}
        onScroll={topScrollbar ? () => syncScroll(containerRef, topScrollRef) : undefined}
      >
        {children}
      </div>
    </div>
  );
}
