import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import Footer from "components/layout/footer";
import WhatsappFab from "components/layout/whatsapp-fab";
import NewsletterPopupLoader from "components/newsletter/newsletter-popup-loader";
import { PriceModeProvider } from "components/price-mode/price-mode-context";
import { getServerPriceMode } from "lib/price-mode";
import { getCart } from "lib/vadmin/cart";
import { ReactNode, Suspense } from "react";
import { Toaster } from "sonner";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <StoreProviders>{children}</StoreProviders>
    </Suspense>
  );
}

async function StoreProviders({ children }: { children: ReactNode }) {
  const cart = getCart();
  const priceMode = await getServerPriceMode();

  return (
    <PriceModeProvider initialMode={priceMode}>
      <CartProvider cartPromise={cart}>
        <Navbar />
        <main>
          {children}
          <Footer />
          <Toaster closeButton />
          <Suspense fallback={null}>
            <WhatsappFab />
          </Suspense>
          <Suspense fallback={null}>
            <NewsletterPopupLoader />
          </Suspense>
        </main>
      </CartProvider>
    </PriceModeProvider>
  );
}
