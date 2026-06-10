import clsx from "clsx";

const Prose = ({
  html,
  className,
  variant = "default",
}: {
  html: string;
  className?: string;
  variant?: "default" | "editor";
}) => {
  const isEditor = variant === "editor";

  return (
    <div
      className={clsx(
        "prose text-base leading-7 text-black",
        isEditor
          ? "w-full max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm prose-headings:mt-6 prose-headings:mb-3 prose-headings:font-semibold prose-p:mb-4 prose-a:underline prose-a:hover:text-neutral-300 prose-ol:mb-4 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mb-4 prose-ul:list-disc prose-ul:pl-6"
          : "mx-auto max-w-6xl prose-headings:mt-8 prose-headings:font-semibold prose-headings:tracking-wide prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg prose-a:text-black prose-a:underline prose-a:hover:text-neutral-300 prose-strong:text-black prose-ol:mt-8 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mt-8 prose-ul:list-disc prose-ul:pl-6",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Prose;
