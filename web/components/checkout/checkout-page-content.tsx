"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import CheckoutForm from "./checkout-form";
import OrderSummary from "./order-summary";
import { Cart, DeliveryMethod, PaymentMethod, ShopConfiguration } from "lib/vadmin/types";
import {
  completeOrder,
  type CheckoutState,
} from "app/(store)/checkout/actions";
import LoadingDots from "components/loading-dots";
import PurchaseProcessingNotice from "components/checkout/purchase-processing-notice";
import webTexts from "../../web-texts.json";
import { useCart } from "components/cart/cart-context";

const checkoutTexts = webTexts.checkoutProcessingNotice;
const MIN_PROCESSING_MS = 1000;

function SubmitButton({ pending, disabled }: { pending: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-8 flex w-full items-center justify-center rounded-[12px] bg-graphite py-4 text-xs font-bold uppercase tracking-[0.2em] text-parchment transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? <LoadingDots className="bg-parchment" /> : "Confirmar Pedido"}
    </button>
  );
}

export default function CheckoutPageContent({
  cart,
  deliveryMethods,
  paymentMethods,
  session,
  provinces,
  localities,
  shopConfig,
}: {
  cart: Cart;
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
  session: any;
  provinces: { id: number; name: string }[];
  localities: { id: number; name: string; province_id: number }[];
  shopConfig: ShopConfiguration;
}) {
  const { cart: liveCart, clearCart, setIsOpen } = useCart();
  const currentCart = liveCart ?? cart;
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    status: "idle",
    message: "",
  });
  const [isCheckoutPending, startCheckoutTransition] = useTransition();
  const [selectedDeliveryFee, setSelectedDeliveryFee] = useState(
    parseFloat(deliveryMethods[0]?.fee || "0")
  );
  const [selectedPaymentFee, setSelectedPaymentFee] = useState(
    parseFloat(paymentMethods[0]?.fee || "0")
  );
  const [showCompletion, setShowCompletion] = useState(false);

  const qtyMet = !shopConfig.min_quantity || currentCart.totalQuantity >= shopConfig.min_quantity;
  const amountMet = !shopConfig.min_amount || parseFloat(currentCart.cost.subtotalAmount.amount) >= shopConfig.min_amount;
  const canCheckout = currentCart.totalQuantity > 0 && qtyMet && amountMet;

  const handleDeliveryChange = (methodId: string) => {
    const method = deliveryMethods.find((m) => m.id === methodId);
    if (method) {
      setSelectedDeliveryFee(parseFloat(method.fee));
    }
  };

  const handlePaymentChange = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    if (method) {
      setSelectedPaymentFee(parseFloat(method.fee));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startCheckoutTransition(async () => {
      const result = await completeOrder(checkoutState, formData);
      if (result.status === "success") {
        clearCart();
        setIsOpen(false);
      }
      setCheckoutState(result);
    });
  };

  const isCheckoutProcessing = checkoutState.status === "success";

  useEffect(() => {
    if (checkoutState.status === "error" && checkoutState.message) {
      toast.error(checkoutState.message);
    }

    if (checkoutState.status !== "success") {
      setShowCompletion(false);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const timeout = window.setTimeout(() => {
      setShowCompletion(true);
    }, MIN_PROCESSING_MS);

    return () => window.clearTimeout(timeout);
  }, [checkoutState.status, checkoutState.message]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      {!isCheckoutProcessing && (
        <h1 className="mb-12 font-serif text-4xl font-medium">
          Finalizar Compra
        </h1>
      )}

      {isCheckoutProcessing ? (
        <section
          aria-live="polite"
          className="flex min-h-[62vh] items-center justify-center"
        >
          <PurchaseProcessingNotice
            isComplete={showCompletion}
            processingTitle={checkoutTexts.processingTitle}
            completeTitle={checkoutTexts.completeTitle}
            completeMessage={checkoutTexts.completeMessage}
          />
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12"
        >

          <div className="space-y-6 lg:col-span-8">
            <CheckoutForm
              initialData={session}
              provinces={provinces}
              localities={localities}
              deliveryMethods={deliveryMethods}
              paymentMethods={paymentMethods}
              onDeliveryChange={handleDeliveryChange}
              onPaymentChange={handlePaymentChange}
            />
          </div>

          <div className="h-fit lg:sticky lg:top-24 lg:col-span-4">
            <OrderSummary
              cart={currentCart}
              shippingFee={selectedDeliveryFee}
              paymentFee={selectedPaymentFee}
              shopConfig={shopConfig}
              qtyMet={qtyMet}
              amountMet={amountMet}
            />
            <SubmitButton pending={isCheckoutPending} disabled={!canCheckout} />
          </div>
        </form>
      )}
    </div>
  );
}
