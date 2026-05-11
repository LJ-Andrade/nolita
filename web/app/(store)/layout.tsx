import { CartProvider } from "components/cart/cart-context";
import { AnnouncementBar } from "components/layout/announcement-bar";
import { Navbar } from "components/layout/navbar";
import Footer from "components/layout/footer";
import { getCart } from "lib/vadmin/cart";
import { ReactNode, Suspense } from "react";
import { Toaster } from "sonner";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cart = getCart();

  return (
    <Suspense fallback={null}>
      <CartProvider cartPromise={cart}>
        <AnnouncementBar />
        <Navbar />
        <main>
          {children}
          <Footer />
          <Toaster closeButton />
        </main>
      </CartProvider>
    </Suspense>
  );
}
