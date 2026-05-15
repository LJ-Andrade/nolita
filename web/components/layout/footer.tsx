import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { getCollections, getProducts, getSiteContent } from "lib/vadmin";

const { COMPANY_NAME, SITE_NAME, COPYRIGHT_YEAR } = process.env;

const FALLBACK_DESCRIPTION =
  "Moda refinada nacida en Buenos Aires. Diseñada para mujeres que se mueven con intención.";

export default async function Footer() {
  const businessInfo = await getSiteContent("business");
  const [collections, products] = await Promise.all([
    getCollections(),
    getProducts(),
  ]);
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
    ]) || "Designed in Buenos Aires · Made with care";
  const developerUrl =
    getSiteValue(businessInfo, [
      "footer_developer_url",
      "business_developer_url",
    ]) || "https://studiovimana.com.ar";
  const businessEmail = getSiteValue(businessInfo, ["business_email"]);
  const businessInstagram = getSiteValue(businessInfo, ["business_instagram"]);
  const description =
    getSiteValue(businessInfo, [
      "footer_description",
      "business_description",
      "business_about",
    ]) || FALLBACK_DESCRIPTION;

  const categoriesWithProducts = new Set(
    products.map((product) => product.category?.handle).filter(Boolean),
  );
  const categoryLinks = collections
    .filter(
      (collection) =>
        collection.handle && categoriesWithProducts.has(collection.handle),
    )
    .map((collection) => ({
      label: collection.title,
      href: `/catalogo?categoria=${collection.handle}`,
    }));

  const categorySplitIndex = Math.ceil(categoryLinks.length / 2);
  const primaryCategoryLinks = categoryLinks.slice(0, categorySplitIndex);
  const secondaryCategoryLinks = categoryLinks.slice(categorySplitIndex);
  const shopLinks = [
    { label: "Novedades", href: "/catalogo?sort=newest" },
    { label: "Ofertas", href: "/catalogo?sort=discount_desc" },
    { label: "Mayoristas", href: "/registro" },
    { label: "Ingresar", href: "/ingreso" },
  ];
  const customerCareLinks = [
    { label: "Envíos y devoluciones", href: "/shipping-returns" },
    { label: "Preguntas frecuentes", href: "/faq" },
    {
      label: "Contacto",
      href: businessEmail ? `mailto:${businessEmail}` : "/contact",
    },
    { label: "Seguir mi pedido", href: "/perfil" },
    { label: "Política de privacidad", href: "/privacy-policy" },
  ];

  return (
    <footer className="border-t border-black/5 bg-[#f4f1ec] text-[#4b3b2f]">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-14 md:px-10 md:py-16 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-20">
          <div className="max-w-[330px]">
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
            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.42em] text-[#9a7a55]">
              Buenos Aires
            </p>
            <p className="mt-8 max-w-[285px] font-serif text-[15px] leading-8 text-[#6f6052]">
              {description}
            </p>
            <div className="mt-7 flex items-center gap-4 text-[#6f6052]">
              {businessInstagram && (
                <a
                  href={businessInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="transition-colors hover:text-black"
                >
                  <InstagramIcon />
                </a>
              )}
              {businessEmail && (
                <a
                  href={`mailto:${businessEmail}`}
                  aria-label="Email"
                  className="transition-colors hover:text-black"
                >
                  <EnvelopeIcon className="h-[18px] w-[18px]" />
                </a>
              )}
            </div>
          </div>

          <FooterColumn title="Tienda" links={shopLinks} />
          <FooterColumn title="Categorías" links={primaryCategoryLinks} />
          <FooterColumn title="Categorías" links={secondaryCategoryLinks} />
          <FooterColumn title="Atención al cliente" links={customerCareLinks} />
        </div>

        <div className="mt-16 border-t border-black/10 pt-11">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="font-serif text-xl leading-none text-black">
                Suscribite a nuestro mundo
              </h3>
              <p className="mt-3 text-xs text-[#6f6052]">
                Novedades, ofertas exclusivas e historias de nuestros ateliers.
              </p>
            </div>
            <form className="flex w-full max-w-[430px]" aria-label="Newsletter">
              <input
                type="email"
                placeholder="Tu email"
                className="h-12 min-w-0 flex-1 border border-black/10 bg-white px-5 text-sm text-black outline-none placeholder:text-[#a38f7e]"
              />
              <button
                type="button"
                className="h-12 bg-black px-7 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2f2922]"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>

        <div className="mt-9 border-t border-black/10 pt-7">
          <div className="flex flex-col gap-4 text-[10px] text-[#9a8a7f] md:flex-row md:items-center md:justify-between">
            <p>
              &copy; {copyrightDate} {copyrightName}. Todos los derechos
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

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.34em] text-black">
        {title}
      </h3>
      <ul className="mt-8 flex flex-col gap-5 text-sm text-[#6f6052]">
        {links.map((link) => (
          <li key={`${title}-${link.href}-${link.label}`}>
            <FooterLink
              href={link.href}
              className="transition-colors hover:text-black"
            >
              {link.label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <rect
        width="17"
        height="17"
        x="3.5"
        y="3.5"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3.7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.1" cy="6.9" r="1" fill="currentColor" />
    </svg>
  );
}
