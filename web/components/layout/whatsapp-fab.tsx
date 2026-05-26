import { getSiteContent } from "lib/vadmin";

function toWhatsappHref(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("http")) return trimmed;
  return `https://wa.me/${trimmed.replace(/\D/g, "")}`;
}

export default async function WhatsappFab() {
  const businessInfo = await getSiteContent("business");
  const whatsapp =
    businessInfo?.business_whatsapp?.trim() ||
    businessInfo?.business_phone?.trim();

  if (!whatsapp) return null;

  return (
    <a
      href={toWhatsappHref(whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-24 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105 hover:bg-[#1ebe5b] md:bottom-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="currentColor"
      >
        <path d="M19.11 17.62c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.07-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.15-1.32-.79-.7-1.32-1.57-1.48-1.84-.16-.27-.02-.42.12-.55.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.14.18 1.92 2.93 4.66 4.11.65.28 1.16.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.22-.63.22-1.18.16-1.28-.06-.11-.25-.18-.52-.32zM16.04 26.5h-.01c-1.79 0-3.55-.48-5.09-1.4l-.36-.21-3.78 1 1.01-3.69-.24-.38c-1.01-1.6-1.54-3.45-1.54-5.36 0-5.54 4.51-10.05 10.05-10.05 2.69 0 5.21 1.05 7.11 2.95s2.94 4.43 2.94 7.11c0 5.54-4.51 10.05-10.09 10.05zm8.55-18.6A11.97 11.97 0 0 0 16.04 4C9.4 4 4 9.4 4 16.04c0 2.12.55 4.18 1.6 6.01L4 28l6.1-1.6c1.77.97 3.77 1.49 5.81 1.49h.01c6.64 0 12.04-5.4 12.04-12.04 0-3.22-1.25-6.24-3.52-8.51z" />
      </svg>
    </a>
  );
}
