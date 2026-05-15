import { getCart } from "lib/vadmin/cart";
import { getDeliveryMethods, getPaymentMethods } from "lib/vadmin/methods";
import { getSession } from "lib/vadmin/auth";
import { getProvinces, getLocalities, getShopConfiguration } from "lib/vadmin";
import CheckoutPageContent from "components/checkout/checkout-page-content";

export const metadata = {
  title: "Checkout",
  description: "Finaliza tu pedido en Nolita.",
};

export default async function CheckoutPage() {
  const cart = await getCart();

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
      cart={cart ?? {
        id: undefined,
        checkoutUrl: "",
        totalQuantity: 0,
        lines: [],
        cost: {
          subtotalAmount: { amount: "0", currencyCode: "ARS" },
          totalAmount: { amount: "0", currencyCode: "ARS" },
          totalTaxAmount: { amount: "0", currencyCode: "ARS" },
        },
      }}
      deliveryMethods={deliveryMethods}
      paymentMethods={paymentMethods}
      session={session}
      provinces={provinces}
      localities={localities}
      shopConfig={shopConfig}
    />
  );
}
