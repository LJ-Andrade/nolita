import { getSiteContent } from "lib/vadmin";

// Announcement bar — shown at the very top of the page
export async function AnnouncementBar() {
  const content = await getSiteContent('home');
  const text = content.home_top_text || "Envíos gratis en pedidos mayoristas · Temporada Otoño–Invierno 2025";

  return (
    <div
      style={{ backgroundColor: "var(--pb-announce-bg)", color: "var(--pb-announce-text)" }}
      className="w-full py-2 text-center text-xs font-medium tracking-widest uppercase"
    >
      {text}
    </div>
  );
}
