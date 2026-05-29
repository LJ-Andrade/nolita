import * as React from "react";
import { cn } from "@/lib/utils";

const getStickyCellClasses = (sticky, isHeader = false) => {
  if (sticky !== "right") return null;

  return cn(
    "sticky right-0",
    isHeader
      ? "z-30 bg-[color:var(--admin-table-header-bg)] shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.45)]"
      : "z-20 bg-inherit shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]",
  );
};

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-visible">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0 [&_tr:nth-child(odd)]:bg-[color:var(--admin-table-row-bg)] [&_tr:nth-child(even)]:bg-[color:var(--admin-table-row-stripe-bg)]",
      className,
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-muted/50 font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:!bg-[color:var(--admin-table-row-hover-bg)] data-[state=selected]:!bg-muted",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, "data-sticky": sticky, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 bg-[color:var(--admin-table-header-bg)] px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      getStickyCellClasses(sticky, true),
      className,
    )}
    data-sticky={sticky}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, "data-sticky": sticky, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-2 align-middle [&:has([role=checkbox])]:pr-0",
      getStickyCellClasses(sticky, false),
      className,
    )}
    data-sticky={sticky}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
