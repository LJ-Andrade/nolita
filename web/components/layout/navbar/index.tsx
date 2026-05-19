import CartModal from "components/cart/modal";
import CartTrigger from "components/cart/trigger";
import PriceModeSwitch from "components/price-mode/price-mode-switch";
import { getMenu, getShopConfiguration } from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import UserMenu from "./user-menu";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");
  const session = await getSession();
  const shopConfig = await getShopConfiguration();

  return (
    <header
      style={{
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
      }}
      className="sticky top-0 z-50 w-full"
    >
      {/* ── Desktop Navbar ─────────────────────────────────────────────── */}
      <nav className="mx-auto hidden h-[76px] max-w-screen-2xl items-center justify-between px-8 md:flex">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            prefetch={true}
            className="relative block h-10 w-44 transition-opacity hover:opacity-75"
            aria-label={SITE_NAME || "Nolita"}
          >
            <Image
              src="/logo-black.png"
              alt={SITE_NAME || "Nolita"}
              fill
              priority
              sizes="176px"
              className="object-contain"
            />
          </Link>
        </div>

        {/* Right: User + Cart */}
        <div className="flex items-center justify-end gap-5">
          <PriceModeSwitch />
          <Suspense fallback={null}>
            <UserMenu customer={session} />
          </Suspense>
          <CartTrigger />
        </div>
      </nav>

      {/* ── Mobile Navbar ──────────────────────────────────────────────── */}
      <div className="flex h-[64px] items-center justify-between bg-white px-4 md:hidden">
        <Link
          href="/"
          prefetch={true}
          className="relative block h-8 w-32 transition-opacity hover:opacity-75"
          aria-label={SITE_NAME || "Nolita"}
        >
          <Image
            src="/logo-black.png"
            alt={SITE_NAME || "Nolita"}
            fill
            priority
            sizes="128px"
            className="object-contain"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} customer={session} />
          </Suspense>
          <Suspense fallback={null}>
            <UserMenu customer={session} />
          </Suspense>
          <CartTrigger />
        </div>
      </div>
      <CartModal shopConfig={shopConfig} />
    </header>
  );
}
