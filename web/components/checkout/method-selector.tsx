"use client";

import { DeliveryMethod, PaymentMethod } from "lib/vadmin/types";
import { useState } from "react";

export default function MethodSelector({ 
  deliveryMethods, 
  paymentMethods,
  onDeliveryChange
}: { 
  deliveryMethods: DeliveryMethod[]; 
  paymentMethods: PaymentMethod[];
  onDeliveryChange?: (methodId: string) => void;
}) {
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryMethods[0]?.id);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]?.id);

  const handleDeliveryChange = (id: string) => {
    setSelectedDelivery(id);
    onDeliveryChange?.(id);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-xl font-medium font-serif border-b border-bone pb-2">Método de Envío</h2>
        <div className="grid grid-cols-1 gap-3">
          {deliveryMethods.map((method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center justify-between rounded-[12px] border p-4 transition-all ${
                selectedDelivery === method.id 
                  ? "border-graphite bg-graphite/5 ring-1 ring-graphite" 
                  : "border-bone bg-parchment/50 hover:bg-bone/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="delivery_method_id"
                  value={method.id}
                  checked={selectedDelivery === method.id}
                  onChange={() => handleDeliveryChange(method.id)}
                  className="h-4 w-4 text-graphite focus:ring-graphite"
                />
                <div>
                  <p className="text-sm font-bold">{method.name}</p>
                  <p className="text-xs text-stone-brown">{method.description}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">
                {parseFloat(method.fee) === 0 ? "Gratis" : `$${method.fee}`}
              </p>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium font-serif border-b border-bone pb-2">Método de Pago</h2>
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center gap-3 rounded-[12px] border p-4 transition-all ${
                selectedPayment === method.id 
                  ? "border-graphite bg-graphite/5 ring-1 ring-graphite" 
                  : "border-bone bg-parchment/50 hover:bg-bone/20"
              }`}
            >
              <input
                type="radio"
                name="payment_method_id"
                value={method.id}
                checked={selectedPayment === method.id}
                onChange={() => setSelectedPayment(method.id)}
                className="h-4 w-4 text-graphite focus:ring-graphite"
              />
              <div>
                <p className="text-sm font-bold">{method.name}</p>
                <p className="text-xs text-stone-brown">{method.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
