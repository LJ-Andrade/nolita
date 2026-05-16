"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  ShoppingCartIcon,
  XMarkIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import LoadingDots from "components/loading-dots";
import Price, { formatPriceAmount } from "components/price";
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
import { usePriceMode } from "components/price-mode/price-mode-context";

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
  const closeCart = () => setIsOpen(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const isCheckoutPage =
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/finalizar-compra");

  const isWholesale = priceMode === "wholesale";
  const hasConditions =
    isWholesale && (shopConfig.min_quantity > 0 || shopConfig.min_amount > 0);
  const qtyMet =
    !isWholesale ||
    !shopConfig.min_quantity ||
    (cart?.totalQuantity ?? 0) >= shopConfig.min_quantity;
  const amountMet =
    !isWholesale ||
    !shopConfig.min_amount ||
    Number(cart?.cost?.subtotalAmount?.amount || 0) >= shopConfig.min_amount;
  const canCheckout = qtyMet && amountMet;

  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      if (!isOpen && !isCheckoutPage) {
        setIsOpen(true);
      }
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, isCheckoutPage, cart?.totalQuantity]);

  return (
    <Transition show={isOpen}>
      <Dialog onClose={closeCart} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-[.5px]"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100 backdrop-blur-[.5px]"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
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
          <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-white/10 bg-black text-white md:w-[420px]">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <p className="text-2xl font-medium font-serif tracking-tight">
                Mi Carrito
              </p>
              <button
                aria-label="Cerrar carrito"
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {!cart || cart.lines.length === 0 ? (
              <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden px-6">
                <div className="mb-6 flex h-20 w-20 items-center justify-center bg-white/10">
                  <ShoppingCartIcon className="h-10 w-10 text-white/60" />
                </div>
                <p className="text-center text-xl font-medium font-serif">
                  Tu carrito está vacío
                </p>
                <p className="mt-2 text-center text-sm text-white/60">
                  Agrega productos para comenzar tu pedido.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-8 border border-white/25 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
                >
                  Seguir Comprando
                </button>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between overflow-hidden">
                <ul className="grow overflow-auto p-6 space-y-6">
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

                      return (
                        <li
                          key={item.id ?? merchandiseId}
                          className={clsx(
                            "flex w-full flex-col border-b border-white/10 pb-6 transition-all duration-300 ease-in-out last:border-0 last:pb-0 motion-reduce:transition-none",
                            isRemoving && "translate-x-full scale-95 opacity-0",
                          )}
                        >
                          <div className="relative flex w-full flex-row">
                            <div className="absolute z-40 -left-2 -top-2">
                              <DeleteItemButton
                                item={item}
                                optimisticUpdate={updateCartItem}
                                tone="light"
                                onRemoveStart={(id) =>
                                  setRemovingItems((current) =>
                                    new Set(current).add(id),
                                  )
                                }
                              />
                            </div>
                            <div className="flex flex-1 flex-row">
                              <div className="relative h-24 w-24 flex-none overflow-hidden bg-white/10">
                                <Image
                                  className="h-full w-full object-cover"
                                  width={96}
                                  height={96}
                                  alt={
                                    item.merchandise.product.featuredImage
                                      ?.altText ||
                                    item.merchandise.product.title
                                  }
                                  src={imageUrl}
                                />
                              </div>
                              <div className="ml-4 flex flex-1 flex-col justify-between py-1">
                                <div>
                                  <Link
                                    href={merchandiseUrl}
                                    onClick={closeCart}
                                    className="text-sm font-medium text-white underline-offset-4 hover:underline"
                                  >
                                    {item.merchandise.product.title}
                                  </Link>
                                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                                    {item.merchandise.selectedOptions.map(
                                      (option, index) => (
                                        <p
                                          key={index}
                                          className="text-[10px] uppercase tracking-wider text-white/55"
                                        >
                                          <span className="font-semibold text-white/35">
                                            {option.name}:
                                          </span>{" "}
                                          {option.value}
                                        </p>
                                      ),
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex h-8 items-center border border-white/15 text-white">
                                    <EditItemQuantityButton
                                      item={item}
                                      type="minus"
                                      optimisticUpdate={updateCartItem}
                                      tone="light"
                                    />
                                    <span className="w-8 text-center text-xs font-medium">
                                      {item.quantity}
                                    </span>
                                    <EditItemQuantityButton
                                      item={item}
                                      type="plus"
                                      optimisticUpdate={updateCartItem}
                                      tone="light"
                                    />
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5">
                                    {item.hasDiscount &&
                                      item.cost.compareAtTotalAmount && (
                                        <span className="text-xs text-white/40 line-through">
                                          {formatPriceAmount(
                                            item.cost.compareAtTotalAmount
                                              .amount,
                                          )}
                                        </span>
                                      )}
                                    <Price
                                      className="text-sm font-bold"
                                      amount={item.cost.totalAmount.amount}
                                      currencyCode={
                                        item.cost.totalAmount.currencyCode
                                      }
                                    />
                                    {item.hasDiscount &&
                                      Number(item.discount ?? 0) > 0 && (
                                        <span className="bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                          -{Math.round(Number(item.discount))}%
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>

                <div className="border-t border-white/10 bg-white/[0.06] p-6">
                  {hasConditions && (
                    <div className="mb-5 space-y-2 text-xs">
                      {shopConfig.min_quantity > 0 && (
                        <div
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2",
                            qtyMet
                              ? "text-emerald-700 bg-emerald-50/60"
                              : "text-amber-700 bg-amber-50/60",
                          )}
                        >
                          {qtyMet ? (
                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                          ) : (
                            <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                          )}
                          <span>
                            Mínimo <strong>{shopConfig.min_quantity}</strong>{" "}
                            prenda{shopConfig.min_quantity !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {shopConfig.min_amount > 0 && (
                        <div
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2",
                            amountMet
                              ? "text-emerald-700 bg-emerald-50/60"
                              : "text-amber-700 bg-amber-50/60",
                          )}
                        >
                          {amountMet ? (
                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                          ) : (
                            <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                          )}
                          <span>
                            Compra mínima de{" "}
                            <strong>
                              $
                              {Number(shopConfig.min_amount).toLocaleString(
                                "es-AR",
                                { minimumFractionDigits: 2 },
                              )}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mb-6 space-y-2 text-sm text-white/60">
                    <div className="flex items-center justify-between">
                      <p>Subtotal</p>
                      <Price
                        className="text-white"
                        amount={cart.cost.subtotalAmount.amount}
                        currencyCode={cart.cost.subtotalAmount.currencyCode}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p>Envío</p>
                      <p className="text-xs italic text-white">
                        Calculado al finalizar
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                      <p className="text-base font-serif font-medium text-white">
                        Total
                      </p>
                      <Price
                        className="text-lg font-bold text-white"
                        amount={cart.cost.totalAmount.amount}
                        currencyCode={cart.cost.totalAmount.currencyCode}
                      />
                    </div>
                  </div>
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
      className="flex w-full items-center justify-center gap-2 bg-white py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      type="submit"
      disabled={disabled || pending}
    >
      {pending ? (
        <LoadingDots className="bg-black" />
      ) : (
        <>
          Continuar al checkout
          <ArrowRightIcon className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
