import { cn } from "@/lib/utils";

export function AdminTableShell({ className, children }) {
  return (
    <div
      className={cn(
        "relative overflow-x-auto overflow-y-hidden rounded-[var(--admin-table-radius)] border-[length:var(--admin-table-border-width)] border-[color:var(--admin-table-border-color)] bg-[color:var(--admin-table-bg)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
