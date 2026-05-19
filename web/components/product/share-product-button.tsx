"use client";

import { ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

type ShareProductButtonProps = {
  title: string;
};

export function ShareProductButton({ title }: ShareProductButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("No se pudo compartir el producto");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex h-12 w-12 shrink-0 items-center justify-center text-neutral-500 transition-colors hover:text-black"
      aria-label="Compartir producto"
    >
      <ShareIcon className="h-6 w-6" />
    </button>
  );
}
