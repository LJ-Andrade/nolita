"use client";

import { usePriceMode } from "components/price-mode/price-mode-context";

type AnnouncementBarClientProps = {
  retailText?: string | null;
  wholesaleText?: string | null;
  fallbackText?: string | null;
};

const defaultText =
  "Envios bonificados en pedidos mayoristas · Nueva coleccion disponible";

export function AnnouncementBarClient({
  retailText,
  wholesaleText,
  fallbackText,
}: AnnouncementBarClientProps) {
  const { priceMode } = usePriceMode();
  const text =
    (priceMode === "wholesale" ? wholesaleText : retailText) ||
    fallbackText ||
    defaultText;

  return (
    <div
      className="flex h-10 items-center justify-center px-6 text-center text-[10px] font-medium uppercase tracking-[0.28em]"
      style={{
        backgroundColor: "var(--pb-announce-bg)",
        color: "var(--pb-announce-text)",
      }}
    >
      {text}
    </div>
  );
}
