"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { AnimatedPrice } from "components/animated-price";
import LoadingDots from "components/loading-dots";
import { formatPriceAmount } from "components/price";
import PriceModeSwitch from "components/price-mode/price-mode-switch";
import { usePriceMode } from "components/price-mode/price-mode-context";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { redirectToCheckout } from "./actions";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";

type ShopConfig = {
  id: number;
  min_quantity: number;
  min_amount: number;
};

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal({ shopConfig }: { shopConfig: ShopConfig }) {
  const { cart, updateCartItem, isOpen, setIsOpen } = useCart();
  const { priceMode } = usePriceMode();
  const pathname = usePathname();
  const quantityRef = useRef(cart?.totalQuantity);
  const hasObservedCartQuantity = useRef(false);
  const closeCart = () => setIsOpen(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const isCheckoutPage =
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/finalizar-compra");

  const isWholesale = priceMode === "wholesale";
  const totalQty = cart?.totalQuantity ?? 0;
  const totalAmount = Number(cart?.cost?.subtotalAmount?.amount || 0);
  const itemsNeeded = Math.max(0, shopConfig.min_quantity - totalQty);
  const amountNeeded = Math.max(0, shopConfig.min_amount - totalAmount);
  const showQtyMissing =
    isWholesale && shopConfig.min_quantity > 0 && itemsNeeded > 0;
  const showAmountMissing =
    isWholesale && shopConfig.min_amount > 0 && amountNeeded > 0;
  const showPromoBanner = showQtyMissing || showAmountMissing;

  const missingParts: string[] = [];
  if (showQtyMissing) {
    missingParts.push(
      `${itemsNeeded} prenda${itemsNeeded !== 1 ? "s" : ""}`,
    );
  }
  if (showAmountMissing) {
    missingParts.push(
      `$${amountNeeded.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    );
  }
  const missingText = missingParts.join(" y ");

  const qtyMet =
    !isWholesale ||
    !shopConfig.min_quantity ||
    totalQty >= shopConfig.min_quantity;
  const amountMet =
    !isWholesale ||
    !shopConfig.min_amount ||
    totalAmount >= shopConfig.min_amount;
  const canCheckout = qtyMet && amountMet;

  const totalDiscount =
    cart?.lines.reduce((acc, item) => {
      if (item.hasDiscount && item.cost.compareAtTotalAmount) {
        return (
          acc +
          (Number(item.cost.compareAtTotalAmount.amount) -
            Number(item.cost.totalAmount.amount))
        );
      }
      return acc;
    }, 0) ?? 0;
  const showDiscountTotal = totalDiscount > 0;

  useEffect(() => {
    if (!cart) {
      return;
    }

    const totalQuantity = cart.totalQuantity ?? 0;

    if (!hasObservedCartQuantity.current) {
      quantityRef.current = totalQuantity;
      hasObservedCartQuantity.current = true;
      return;
    }

    if (
      totalQuantity > 0 &&
      totalQuantity !== quantityRef.current &&
      totalQuantity > (quantityRef.current ?? 0)
    ) {
      if (!isOpen && !isCheckoutPage) {
        setIsOpen(true);
      }
    }

    quantityRef.current = totalQuantity;
  }, [isOpen, isCheckoutPage, cart?.totalQuantity, setIsOpen]);

  return (
    <Transition show={isOpen}>
      <Dialog onClose={closeCart} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full max-w-full flex-col overflow-x-hidden bg-white text-black md:w-[400px]">
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex items-center justify-end border-b border-gray-100 px-5 py-4">
              <PriceModeSwitch />
            </div>

            {!cart || cart.lines.length === 0 ? (
              <div className="mt-20 flex w-full flex-col items-center justify-center px-6">
                <div className="mb-6 flex h-16 w-16 items-center justify-center bg-gray-50">
                  <ShoppingCartIcon className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-center text-lg font-medium">
                  Tu carrito está vacío
                </p>
                <p className="mt-2 text-center text-sm text-gray-400">
                  Agrega productos para comenzar tu pedido.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-8 border border-black px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white"
                >
                  Seguir Comprando
                </button>
              </div>
            ) : (
              <div className="flex h-full min-w-0 flex-col overflow-hidden">
                {/* ── Promo Banner ─────────────────────────────────── */}
                {showPromoBanner && (
                  <div className="mx-4 mt-4 flex items-center gap-2 rounded-full border border-[#D4006A]/25 bg-[#D4006A]/5 px-4 py-2 text-xs text-[#D4006A]">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4006A]" />
                    <span>
                      Te falta agregar <strong>{missingText}</strong> para
                      alcanzar el mínimo mayorista
                    </span>
                  </div>
                )}

                {/* ── Items ────────────────────────────────────────── */}
                <ul className="grow space-y-0 overflow-x-hidden overflow-y-auto px-4 py-4 md:px-5">
                  {cart.lines
                    .sort((a, b) =>
                      a.merchandise.product.title.localeCompare(
                        b.merchandise.product.title,
                      ),
                    )
                    .map((item) => {
                      const merchandiseId = item.merchandise.id;
                      const isRemoving = removingItems.has(merchandiseId);
                      const merchandiseSearchParams =
                        {} as MerchandiseSearchParams;

                      item.merchandise.selectedOptions.forEach(
                        ({ name, value }) => {
                          if (value !== DEFAULT_OPTION) {
                            merchandiseSearchParams[name.toLowerCase()] = value;
                          }
                        },
                      );

                      const merchandiseUrl = createUrl(
                        `/producto/${item.merchandise.product.handle}`,
                        new URLSearchParams(merchandiseSearchParams),
                      );

                      const colorOption = item.merchandise.selectedOptions.find(
                        (o) => o.name.toLowerCase() === "color",
                      );
                      const colorImage = colorOption
                        ? item.merchandise.product.colorImages?.find(
                            (ci) =>
                              ci.color.toLowerCase() ===
                              colorOption.value.toLowerCase(),
                          )?.url
                        : null;

                      const imageUrl =
                        colorImage ||
                        item.merchandise.product.featuredImage?.url ||
                        "";

                      const optionsLabel = item.merchandise.selectedOptions
                        .filter((o) => o.value !== DEFAULT_OPTION)
                        .map((o) => `${o.name}: ${o.value}`)
                        .join(" | ");

                      return (
                        <li
                          key={item.id ?? merchandiseId}
                          className={clsx(
                            "flex w-full min-w-0 gap-3 border-b border-gray-100 py-4 transition-all duration-300 last:border-0",
                            isRemoving && "translate-x-full opacity-0",
                          )}
                        >
                          {/* Image */}
                          <Link
                            href={merchandiseUrl}
                            onClick={closeCart}
                            className="h-20 w-20 shrink-0 overflow-hidden bg-gray-50"
                          >
                            <Image
                              src={imageUrl}
                              alt={item.merchandise.product.title}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          </Link>

                          {/* Info */}
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <Link
                                href={merchandiseUrl}
                                onClick={closeCart}
                                className="min-w-0 flex-1 text-sm font-medium leading-snug underline-offset-2 line-clamp-2 hover:underline"
                              >
                                {item.merchandise.product.title}
                              </Link>
                              <div className="shrink-0">
                                <DeleteItemButton
                                  item={item}
                                  optimisticUpdate={updateCartItem}
                                  tone="dark"
                                  onRemoveStart={(id) =>
                                    setRemovingItems((cur) =>
                                      new Set(cur).add(id),
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {optionsLabel && (
                              <p
                                className="text-xs"
                                style={{ color: "#D4006A" }}
                              >
                                {optionsLabel}
                              </p>
                            )}

                            <div className="mt-auto flex min-w-0 items-center justify-between gap-3 pt-2">
                              <div className="flex h-8 shrink-0 items-center border border-gray-200">
                                <EditItemQuantityButton
                                  item={item}
                                  type="minus"
                                  optimisticUpdate={updateCartItem}
                                  tone="dark"
                                />
                                <span className="w-8 text-center text-xs font-medium">
                                  {item.quantity}
                                </span>
                                <EditItemQuantityButton
                                  item={item}
                                  type="plus"
                                  optimisticUpdate={updateCartItem}
                                  tone="dark"
                                />
                              </div>

                              <div className="min-w-0 overflow-hidden text-right">
                                <AnimatedPrice
                                  className="max-w-full overflow-hidden text-sm font-semibold"
                                  compareClass="text-xs text-gray-300"
                                  layoutClass="flex flex-col items-end gap-0.5"
                                  priceClass="text-sm font-semibold"
                                  value={{
                                    amount: item.cost.totalAmount.amount,
                                    compareAtAmount:
                                      item.hasDiscount &&
                                      item.cost.compareAtTotalAmount
                                        ? item.cost.compareAtTotalAmount.amount
                                        : undefined,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="border-t border-gray-100 bg-white p-5">
                  <div className="mb-5 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">
                        Subtotal ({totalQty} producto{totalQty !== 1 ? "s" : ""}
                        )
                      </span>
                      <AnimatedPrice
                        className="font-medium"
                        priceClass="font-medium"
                        value={{ amount: cart.cost.subtotalAmount.amount }}
                      />
                    </div>
                    {showDiscountTotal && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Descuentos</span>
                        <span className="font-medium">
                          -{formatPriceAmount(totalDiscount.toFixed(2))}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-base font-semibold">Total</span>
                      <AnimatedPrice
                        className="text-base font-bold"
                        priceClass="text-base font-bold"
                        value={{ amount: cart.cost.totalAmount.amount }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={closeCart}
                    className="mb-3 flex w-full items-center justify-center gap-2 border border-black py-3 text-sm font-semibold tracking-wide text-black transition-opacity hover:opacity-80"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Continuar comprando
                  </button>
                  <form action={redirectToCheckout}>
                    <CheckoutButton disabled={canCheckout === false} />
                  </form>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center justify-center gap-2 bg-black py-4 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      type="submit"
      disabled={disabled || pending}
    >
      {pending ? (
        <LoadingDots className="bg-white" />
      ) : (
        <>
          Finalizar compra
          <ArrowRightIcon className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
