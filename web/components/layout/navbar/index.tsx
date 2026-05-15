import CartModal from "components/cart/modal";
import CartTrigger from "components/cart/trigger";
import PriceModeSwitch from "components/price-mode/price-mode-switch";
import { getMenu, getShopConfiguration } from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");
  const session = await getSession();
  const shopConfig = await getShopConfiguration();

  return (
    <header
      style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff" }}
      className="sticky top-0 z-50 w-full"
    >
      {/* ── Desktop Navbar ─────────────────────────────────────────────── */}
      <nav className="mx-auto hidden h-[76px] max-w-screen-2xl items-center px-8 md:grid md:grid-cols-3">

        <div aria-hidden="true" />

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link
            href="/"
            prefetch={true}
            className="text-[46px] font-normal uppercase leading-none tracking-[0.18em] text-black"
            aria-label={SITE_NAME || "Nolita"}
          >
            NOLITA
          </Link>
        </div>

        {/* Right: User + Cart */}
        <div className="flex items-center justify-end gap-5">
          <PriceModeSwitch />
          <CartTrigger />
        </div>
      </nav>

      {/* ── Mobile Navbar ──────────────────────────────────────────────── */}
      <div className="flex h-[64px] items-center justify-between bg-white px-4 md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} customer={session} />
        </Suspense>
        <Link
          href="/"
          prefetch={true}
          className="text-3xl font-normal uppercase leading-none tracking-[0.18em] text-black"
          aria-label={SITE_NAME || "Nolita"}
        >
          NOLITA
        </Link>
        <CartTrigger />
      </div>
      <CartModal shopConfig={shopConfig} />
    </header>
  );
}
