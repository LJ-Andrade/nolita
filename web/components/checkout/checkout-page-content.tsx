"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import CheckoutForm from "./checkout-form";
import MethodSelector from "./method-selector";
import OrderSummary from "./order-summary";
import { Cart, DeliveryMethod, PaymentMethod } from "lib/vadmin/types";
import {
  completeOrder,
  type CheckoutState,
} from "app/(store)/checkout/actions";
import { useFormStatus } from "react-dom";
import LoadingDots from "components/loading-dots";
import PurchaseProcessingNotice from "components/checkout/purchase-processing-notice";
import webTexts from "../../web-texts.json";

const checkoutTexts = webTexts.checkoutProcessingNotice;
const MIN_PROCESSING_MS = 1000;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
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
}: {
  cart: Cart;
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
  session: any;
  provinces: { id: number; name: string }[];
  localities: { id: number; name: string; province_id: number }[];
}) {
  const [checkoutState, checkoutAction, isCheckoutPending] = useActionState<
    CheckoutState,
    FormData
  >(completeOrder, {
    status: "idle",
    message: "",
  });
  const [selectedDeliveryFee, setSelectedDeliveryFee] = useState(
    parseFloat(deliveryMethods[0]?.fee || "0")
  );
  const [showCompletion, setShowCompletion] = useState(false);

  const handleDeliveryChange = (methodId: string) => {
    const method = deliveryMethods.find((m) => m.id === methodId);
    if (method) {
      setSelectedDeliveryFee(parseFloat(method.fee));
    }
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
          action={checkoutAction}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12"
        >

          <div className="space-y-12 lg:col-span-8">
            <MethodSelector
              deliveryMethods={deliveryMethods}
              paymentMethods={paymentMethods}
              onDeliveryChange={handleDeliveryChange}
            />
            <CheckoutForm initialData={session} provinces={provinces} localities={localities} />
          </div>

          <div className="h-fit lg:sticky lg:top-24 lg:col-span-4">
            <OrderSummary cart={cart} shippingFee={selectedDeliveryFee} />
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  );
}
