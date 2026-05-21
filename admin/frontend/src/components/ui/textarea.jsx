import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-[color:var(--admin-input-border-color)] bg-[color:var(--admin-input-bg)] px-3 py-2 text-base text-[color:var(--admin-input-text)] ring-offset-background placeholder:text-[color:var(--admin-input-placeholder)] focus-visible:border-[color:var(--admin-input-focus-border-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
