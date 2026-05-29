import { cn } from "@/lib/utils";

export function RichTextPreview({ html, className }) {
  if (!html) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div
      className={cn(
        "max-w-xl text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:my-0 [&_p+p]:mt-1 [&_strong]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
