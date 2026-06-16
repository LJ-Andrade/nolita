import Image from "next/image";
import Link from "next/link";

import { getSiteContent } from "lib/vadmin";

const { COMPANY_NAME, SITE_NAME, COPYRIGHT_YEAR } = process.env;

type SocialLink = {
  href: string;
  label: string;
  icon: "facebook" | "instagram" | "tiktok" | "whatsapp";
};

export default async function Footer() {
  const businessInfo = await getSiteContent("business");
  const copyrightDate = COPYRIGHT_YEAR || "2026";
  const copyrightName =
    getSiteValue(businessInfo, [
      "business_name",
      "company_name",
      "site_name",
    ]) ||
    COMPANY_NAME ||
    SITE_NAME ||
    "Nolita";
  const developerLabel =
    getSiteValue(businessInfo, [
      "footer_developer_label",
      "business_developer_label",
    ]) || "Diseño & Desarrollo por Studio Vimana";
  const developerUrl =
    getSiteValue(businessInfo, [
      "footer_developer_url",
      "business_developer_url",
    ]) || "https://studiovimana.com.ar";
  const businessEmail =
    getSiteValue(businessInfo, ["business_email"]) || "nolitavos@gmail.com";
  const businessPhone =
    getSiteValue(businessInfo, ["business_phone", "business_whatsapp"]) ||
    "11-2490-6000";
  const socialLinks = getSocialLinks(businessInfo);

  return (
    <footer className="border-t border-black/10 bg-white text-[#1f1f1f]">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-9 md:px-10 lg:px-16">
        <div className="flex flex-col gap-7 border-b border-black/10 pb-8 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            aria-label={SITE_NAME || "Nolita"}
            className="relative block h-8 w-36 transition-opacity hover:opacity-70"
          >
            <Image
              src="/logo-black.png"
              alt={SITE_NAME || "Nolita"}
              fill
              sizes="144px"
              className="object-contain object-left"
            />
          </Link>

          <div className="flex flex-col gap-4 text-[11px] font-semibold text-neutral-400 md:flex-row md:items-center md:gap-12">
            <Link
              href="/terminos-y-condiciones"
              className="transition-colors hover:text-black"
            >
              Términos y Condiciones
            </Link>
            <a
              href={`mailto:${businessEmail}`}
              className="transition-colors hover:text-black"
            >
              {businessEmail}
            </a>
            <a
              href={`tel:${toPhoneHref(businessPhone)}`}
              className="transition-colors hover:text-black"
            >
              {businessPhone}
            </a>
          </div>
        </div>

        {socialLinks.length > 0 ? (
          <nav
            aria-label="Redes sociales"
            className="flex justify-center border-b border-black/10 py-14"
          >
            <ul className="flex items-center justify-center gap-4">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors hover:border-black hover:text-black"
                  >
                    <SocialIcon icon={link.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="flex flex-col gap-4 pt-4 text-[10px] font-medium text-neutral-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {copyrightDate} {copyrightName} - Buenos Aires. Todos los derechos
            reservados.
          </p>
          <a
            href={developerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            {developerLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}

function getSiteValue(content: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = content[key]?.trim();

    if (value) {
      return value;
    }
  }

  return "";
}

function getSocialLinks(content: Record<string, string>): SocialLink[] {
  const facebook = getSiteValue(content, ["business_facebook"]);
  const instagram = getSiteValue(content, ["business_instagram"]);
  const tiktok = getSiteValue(content, ["business_tiktok"]);
  const whatsapp = getSiteValue(content, ["business_whatsapp"]);

  return [
    facebook
      ? {
          href: facebook,
          label: "Facebook",
          icon: "facebook" as const,
        }
      : null,
    instagram
      ? {
          href: instagram,
          label: "Instagram",
          icon: "instagram" as const,
        }
      : null,
    tiktok
      ? {
          href: tiktok,
          label: "TikTok",
          icon: "tiktok" as const,
        }
      : null,
    whatsapp
      ? {
          href: toWhatsappHref(whatsapp),
          label: "WhatsApp",
          icon: "whatsapp" as const,
        }
      : null,
  ].filter((link): link is SocialLink => link !== null);
}

function toPhoneHref(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function toWhatsappHref(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("http")) {
    return trimmed;
  }

  return `https://wa.me/${trimmed.replace(/\D/g, "")}`;
}

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  if (icon === "facebook") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.2v2.2H7.3V13h2.8v8h3.4Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <rect
          width="16"
          height="16"
          x="4"
          y="4"
          rx="4.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.8" cy="7.2" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "tiktok") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M15 3c.4 2.5 1.8 4 4 4.2V10c-1.5 0-2.8-.5-4-1.3v6.3c0 3.6-2.1 5.8-5.4 5.8-2.8 0-4.8-1.9-4.8-4.5 0-2.8 2.1-4.7 5.2-4.7.4 0 .8 0 1.1.1v2.9a3.2 3.2 0 0 0-1.1-.2c-1.3 0-2.1.7-2.1 1.8s.8 1.8 1.9 1.8c1.3 0 2.1-.8 2.1-2.6V3H15Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6.9 18.3 4.5 19l.8-2.3a7.5 7.5 0 1 1 1.6 1.6Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9.1 8.6c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.5 1.3c.1.3 0 .5-.1.6l-.4.5c.6 1.1 1.3 1.8 2.4 2.4l.5-.4c.2-.1.4-.2.6-.1l1.4.6c.3.1.4.3.4.6v.4c0 .3-.1.6-.4.8-.4.3-1 .5-1.7.4-2.8-.4-5.1-2.6-5.5-5.5-.1-.6.1-1.2.4-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
