export function SectionActionsBar({ children }) {
  if (!children) return null;

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-2 rounded-md border bg-card px-4 py-3">
      {children}
    </div>
  );
}
