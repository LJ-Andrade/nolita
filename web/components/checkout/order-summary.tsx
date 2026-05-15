"use client";

import Price from "components/price";
import { formatPriceAmount } from "components/price";
import { Cart, ShopConfiguration } from "lib/vadmin/types";
import Image from "next/image";
import { DeleteItemButton } from "components/cart/delete-item-button";
import { useCart } from "components/cart/cart-context";
import { EditItemQuantityButton } from "components/cart/edit-item-quantity-button";
import { CheckIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";

const VADMIN_API =
  process.env.NEXT_PUBLIC_VADMIN_API_URL || "http://localhost:8000/api";

type AppliedCoupon = {
  code: string;
  discount_type: "percentage" | "fixed";
  amount: number;
};

function calculateCouponDiscount(coupon: AppliedCoupon | null, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0;

  const discount =
    coupon.discount_type === "percentage"
      ? subtotal * Math.min(coupon.amount, 100) / 100
      : coupon.amount;

  return Math.round(Math.min(Math.max(discount, 0), subtotal) * 100) / 100;
}

export default function OrderSummary({
  cart,
  shippingFee = 0,
  paymentFee = 0,
  shopConfig,
  priceMode = "retail",
  qtyMet,
  amountMet,
}: {
  cart: Cart;
  shippingFee?: number;
  paymentFee?: number;
  shopConfig: ShopConfiguration;
  priceMode?: "retail" | "wholesale";
  qtyMet: boolean;
  amountMet: boolean;
}) {
  const { updateCartItem } = useCart();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  const couponDiscount = calculateCouponDiscount(appliedCoupon, subtotal);
  const total = Math.max(subtotal - couponDiscount, 0) + shippingFee + paymentFee;
  const hasConditions = priceMode === "wholesale" && (shopConfig.min_quantity > 0 || shopConfig.min_amount > 0);
  const normalizedCouponCode = couponCode.trim();

  const handleCouponChange = (value: string) => {
    setCouponCode(value);
    setCouponError("");

    if (appliedCoupon && value.trim().toLowerCase() !== appliedCoupon.code.toLowerCase()) {
      setAppliedCoupon(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!normalizedCouponCode || isCheckingCoupon) return;

    setIsCheckingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch(`${VADMIN_API}/catalog/coupons/validate`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: normalizedCouponCode,
          subtotal,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Cupón inválido");
      }

      setAppliedCoupon({
        code: json.data.code,
        discount_type: json.data.discount_type,
        amount: Number(json.data.amount),
      });
      setCouponCode(json.data.code);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error instanceof Error ? error.message : "No pudimos validar el cupón");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  return (
    <div className="rounded-[12px] border border-bone bg-parchment p-6">
      <h2 className="mb-6 text-xl font-medium font-serif">Resumen de Compra</h2>
      
      <ul className="mb-6 space-y-4">
        {cart.lines.length === 0 && (
          <li className="rounded-[8px] bg-bone/40 px-4 py-6 text-center text-sm text-stone-brown">
            Tu carrito está vacío.
          </li>
        )}
        {cart.lines.map((item) => {
          const merchandiseId = item.merchandise.id;
          const isRemoving = removingItems.has(merchandiseId);
          const colorOption = item.merchandise.selectedOptions.find(o => o.name.toLowerCase() === "color");
          const colorImage = colorOption 
            ? item.merchandise.product.colorImages?.find(ci => ci.color.toLowerCase() === colorOption.value.toLowerCase())?.url
            : null;
          
          const imageUrl = colorImage || item.merchandise.product.featuredImage.url;

          return (
          <li
            key={item.id ?? merchandiseId}
            className={clsx(
              "flex items-start gap-4 transition-all duration-300 ease-in-out motion-reduce:transition-none",
              isRemoving && "translate-x-full scale-95 opacity-0"
            )}
          >
            <div className="relative h-20 w-20 flex-none">
              <div className="absolute z-40 -left-2 -top-2">
                <DeleteItemButton
                  item={item}
                  optimisticUpdate={updateCartItem}
                  onRemoveStart={(id) =>
                    setRemovingItems((current) => new Set(current).add(id))
                  }
                />
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
              <div className="mt-3 flex h-8 w-fit items-center rounded-[12px] border border-bone">
                <EditItemQuantityButton
                  item={item}
                  type="minus"
                  optimisticUpdate={updateCartItem}
                />
                <span className="w-8 text-center text-xs font-medium">
                  {item.quantity}
                </span>
                <EditItemQuantityButton
                  item={item}
                  type="plus"
                  optimisticUpdate={updateCartItem}
                />
              </div>
            </div>
            <div className="mt-1 flex flex-col items-end gap-1">
              {item.hasDiscount && item.cost.compareAtTotalAmount && (
                <span className="text-xs text-stone-brown/50 line-through">
                  {formatPriceAmount(item.cost.compareAtTotalAmount.amount)}
                </span>
              )}
              <Price
                className="text-sm font-bold"
                amount={item.cost.totalAmount.amount}
                currencyCode={item.cost.totalAmount.currencyCode}
              />
              {item.hasDiscount && Number(item.discount ?? 0) > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  -{Math.round(Number(item.discount))}%
                </span>
              )}
            </div>
          </li>
          );
        })}
      </ul>

      <div className="space-y-2 border-t border-bone pt-6 text-sm">
        <input type="hidden" name="coupon_code" value={appliedCoupon?.code ?? ""} />
        {hasConditions && (
          <div className="mb-4 space-y-2 text-xs">
            {shopConfig.min_quantity > 0 && (
              <div className={clsx(
                "flex items-center gap-2 rounded-[8px] px-3 py-2",
                qtyMet ? "text-emerald-700 bg-emerald-50/60" : "text-amber-700 bg-amber-50/60"
              )}>
                {qtyMet
                  ? <CheckCircleIcon className="h-4 w-4 shrink-0" />
                  : <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                }
                <span>Mínimo <strong>{shopConfig.min_quantity}</strong> prenda{shopConfig.min_quantity !== 1 ? 's' : ''}</span>
              </div>
            )}
            {shopConfig.min_amount > 0 && (
              <div className={clsx(
                "flex items-center gap-2 rounded-[8px] px-3 py-2",
                amountMet ? "text-emerald-700 bg-emerald-50/60" : "text-amber-700 bg-amber-50/60"
              )}>
                {amountMet
                  ? <CheckCircleIcon className="h-4 w-4 shrink-0" />
                  : <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                }
                <span>Compra mínima de <strong>${Number(shopConfig.min_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-stone-brown">Subtotal</span>
          <Price amount={subtotal.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
        </div>
        <div className="space-y-2 py-2">
          <label className="text-xs font-medium uppercase tracking-widest text-stone-brown/80">
            Cupón
          </label>
          <div className="flex h-10 overflow-hidden rounded-[10px] border border-bone bg-bone/20">
            <input
              value={couponCode}
              onChange={(event) => handleCouponChange(event.target.value)}
              placeholder="Código"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-stone-brown/60"
            />
            {normalizedCouponCode && (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isCheckingCoupon || !normalizedCouponCode}
                aria-label="Aplicar cupón"
                className="flex w-10 items-center justify-center border-l border-bone bg-parchment transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {appliedCoupon && (
            <p className="text-xs text-emerald-700">
              Cupón {appliedCoupon.code} aplicado.
            </p>
          )}
          {couponError && (
            <p className="text-xs text-red-600">
              {couponError}
            </p>
          )}
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Descuento</span>
            <Price amount={`-${couponDiscount}`} currencyCode={cart.cost.subtotalAmount.currencyCode} />
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-stone-brown">Envío</span>
          {shippingFee > 0 ? (
            <Price amount={shippingFee.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
          ) : (
            <span className="text-green-600 font-medium">Gratis</span>
          )}
        </div>
        {paymentFee > 0 && (
          <div className="flex justify-between">
            <span className="text-stone-brown">Recargo método de pago</span>
            <Price amount={paymentFee.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
          </div>
        )}
        <div className="flex justify-between border-t border-bone pt-4 text-lg font-bold">
          <span>Total</span>
          <Price amount={total.toString()} currencyCode={cart.cost.subtotalAmount.currencyCode} />
        </div>
      </div>
    </div>
  );
}

