import { getCart } from "lib/vadmin/cart";
import { getDeliveryMethods, getPaymentMethods } from "lib/vadmin/methods";
import { getSession } from "lib/vadmin/auth";
import { getProvinces, getLocalities, getShopConfiguration } from "lib/vadmin";
import { redirect } from "next/navigation";
import CheckoutPageContent from "components/checkout/checkout-page-content";

export const metadata = {
  title: "Checkout",
  description: "Finaliza tu pedido en PlanB.",
};

export default async function CheckoutPage() {
  const cart = await getCart();

  if (!cart || cart.lines.length === 0) {
    redirect("/");
  }

  const [deliveryMethods, paymentMethods, session, provinces, localities, shopConfig] = await Promise.all([
    getDeliveryMethods(),
    getPaymentMethods(),
    getSession(),
    getProvinces(),
    getLocalities(),
    getShopConfiguration(),
  ]);

  return (
    <CheckoutPageContent
      cart={cart}
      deliveryMethods={deliveryMethods}
      paymentMethods={paymentMethods}
      session={session}
      provinces={provinces}
      localities={localities}
      shopConfig={shopConfig}
    />
  );
}
