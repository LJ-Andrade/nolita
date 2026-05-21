import { cn } from "@/lib/utils";

export function AdminTableShell({ className, children }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--admin-table-radius)] border-[length:var(--admin-table-border-width)] border-[color:var(--admin-table-border-color)] bg-[color:var(--admin-table-bg)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
