"use client";

import Price from "components/price";
import { Cart } from "lib/vadmin/types";
import Image from "next/image";
import { DeleteItemButton } from "components/cart/delete-item-button";
import { useCart } from "components/cart/cart-context";

export default function OrderSummary({ cart, shippingFee = 0 }: { cart: Cart; shippingFee?: number }) {
  const { updateCartItem } = useCart();
  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  const total = subtotal + shippingFee;

  return (
    <div className="rounded-[12px] border border-bone bg-parchment p-6">
      <h2 className="mb-6 text-xl font-medium font-serif">Resumen de Compra</h2>
      
      <ul className="mb-6 space-y-4">
        {cart.lines.map((item, i) => {
          const colorOption = item.merchandise.selectedOptions.find(o => o.name.toLowerCase() === "color");
          const colorImage = colorOption 
            ? item.merchandise.product.colorImages?.find(ci => ci.color.toLowerCase() === colorOption.value.toLowerCase())?.url
            : null;
          
          const imageUrl = colorImage || item.merchandise.product.featuredImage.url;

          return (
          <li key={i} className="flex items-start gap-4">
            <div className="relative h-20 w-20 flex-none">
              <div className="absolute z-40 -left-2 -top-2">
                <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
              </div>
              <div className="relative h-full w-full overflow-hidden rounded-[8px] bg-bone">
                <Image
                  src={imageUrl}
                  alt={item.merchandise.product.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <p className="text-sm font-medium leading-snug">{item.merchandise.product.title}</p>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                  {item.merchandise.selectedOptions.map((option, index) => (
                    <p key={index} className="text-[10px] text-stone-brown uppercase tracking-wider">
                      <span className="font-semibold text-stone-brown/60">{option.name}:</span> {option.value}
                    </p>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-stone-brown">Cant: {item.quantity}</p>
            </div>
            <Price
              className="text-sm font-bold mt-1"
              amount={item.cost.totalAmount.amount}
              currencyCode={item.cost.totalAmount.currencyCode}
            />
          </li>
          );
        })}
      </ul>

      <div className="space-y-2 border-t border-bone pt-6 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-brown">Subtotal</span>
          <Price amount={subtotal.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
        </div>
        <div className="flex justify-between">
          <span className="text-stone-brown">Envío</span>
          {shippingFee > 0 ? (
            <Price amount={shippingFee.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
          ) : (
            <span className="text-green-600 font-medium">Gratis</span>
          )}
        </div>
        <div className="flex justify-between border-t border-bone pt-4 text-lg font-bold">
          <span>Total</span>
          <Price amount={total.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
        </div>
      </div>
    </div>
  );
}
