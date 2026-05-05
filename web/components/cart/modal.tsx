"use client";

import { Dialog, Transition } from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import LoadingDots from "components/loading-dots";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { redirectToCheckout } from "./actions";

import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal() {
  const { cart, updateCartItem, isOpen, setIsOpen } = useCart();
  const quantityRef = useRef(cart?.totalQuantity);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity]);

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
          <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-bone bg-parchment text-black md:w-[420px]">
            <div className="flex items-center justify-between p-6 border-b border-bone/50">
              <p className="text-2xl font-medium font-serif tracking-tight">Mi Carrito</p>
              <button 
                aria-label="Cerrar carrito" 
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-bone bg-bone/20 hover:bg-bone transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {!cart || cart.lines.length === 0 ? (
              <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden px-6">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bone/30">
                  <ShoppingCartIcon className="h-10 w-10 text-stone-brown/50" />
                </div>
                <p className="text-center text-xl font-medium font-serif">Tu carrito está vacío</p>
                <p className="mt-2 text-center text-sm text-stone-brown">Agrega productos para comenzar tu pedido.</p>
                <button 
                  onClick={closeCart}
                  className="mt-8 rounded-[12px] border border-graphite px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-graphite hover:text-parchment transition-all"
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
                    .map((item, i) => {
                      const merchandiseSearchParams = {} as MerchandiseSearchParams;

                      item.merchandise.selectedOptions.forEach(({ name, value }) => {
                        if (value !== DEFAULT_OPTION) {
                          merchandiseSearchParams[name.toLowerCase()] = value;
                        }
                      });

                      const merchandiseUrl = createUrl(
                        `/product/${item.merchandise.product.handle}`,
                        new URLSearchParams(merchandiseSearchParams),
                      );

                      const colorOption = item.merchandise.selectedOptions.find(o => o.name.toLowerCase() === "color");
                      const colorImage = colorOption 
                        ? item.merchandise.product.colorImages?.find(ci => ci.color.toLowerCase() === colorOption.value.toLowerCase())?.url
                        : null;
                      
                      const imageUrl = colorImage || item.merchandise.product.featuredImage?.url || "";

                      return (
                        <li key={i} className="flex w-full flex-col pb-6 border-b border-bone/50 last:border-0 last:pb-0">
                          <div className="relative flex w-full flex-row">
                            <div className="absolute z-40 -left-2 -top-2">
                              <DeleteItemButton
                                item={item}
                                optimisticUpdate={updateCartItem}
                              />
                            </div>
                            <div className="flex flex-1 flex-row">
                              <div className="relative h-24 w-24 flex-none overflow-hidden rounded-[12px] bg-bone">
                                <Image
                                  className="h-full w-full object-cover"
                                  width={96}
                                  height={96}
                                  alt={item.merchandise.product.featuredImage?.altText || item.merchandise.product.title}
                                  src={imageUrl}
                                />
                              </div>
                              <div className="ml-4 flex flex-1 flex-col justify-between py-1">
                                <div>
                                  <Link
                                    href={merchandiseUrl}
                                    onClick={closeCart}
                                    className="text-sm font-medium hover:underline underline-offset-4"
                                  >
                                    {item.merchandise.product.title}
                                  </Link>
                                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                                    {item.merchandise.selectedOptions.map((option, index) => (
                                      <p key={index} className="text-[10px] text-stone-brown uppercase tracking-wider">
                                        <span className="font-semibold text-stone-brown/60">{option.name}:</span> {option.value}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex h-8 items-center rounded-[12px] border border-bone">
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
                                  <Price
                                    className="text-sm font-bold"
                                    amount={item.cost.totalAmount.amount}
                                    currencyCode={item.cost.totalAmount.currencyCode}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>

                <div className="p-6 bg-bone/30 border-t border-bone/50">
                  <div className="space-y-2 text-sm text-stone-brown mb-6">
                    <div className="flex items-center justify-between">
                      <p>Subtotal</p>
                      <Price
                        className="text-black"
                        amount={cart.cost.subtotalAmount.amount}
                        currencyCode={cart.cost.subtotalAmount.currencyCode}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p>Envío</p>
                      <p className="text-black italic text-xs">Calculado al finalizar</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-bone/50">
                      <p className="text-base font-serif font-medium text-black">Total</p>
                      <Price
                        className="text-lg font-bold text-black"
                        amount={cart.cost.totalAmount.amount}
                        currencyCode={cart.cost.totalAmount.currencyCode}
                      />
                    </div>
                  </div>
                  <form action={redirectToCheckout}>
                    <CheckoutButton />
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

function CheckoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-graphite py-4 text-xs font-bold uppercase tracking-[0.2em] text-parchment transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <LoadingDots className="bg-parchment" />
      ) : (
        <>
          Continuar al checkout
          <ArrowRightIcon className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
