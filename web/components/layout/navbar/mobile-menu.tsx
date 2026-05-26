"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  HeartIcon,
  Squares2X2Icon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useState } from "react";
import { LogoutButton } from "./logout-button";

export default function MobileMenu({ menu, customer }: { menu: any[]; customer: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Open mobile menu"
        className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:bg-neutral-50 md:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
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
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col overflow-y-auto bg-white pb-8 text-black">
              <div className="p-4">
                <button
                  className="mb-8 flex h-10 w-10 items-center justify-center rounded-[12px] border border-neutral-200 text-black transition-colors hover:bg-neutral-50"
                  onClick={closeMobileMenu}
                  aria-label="Close mobile menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="space-y-8">
                  <nav aria-label="Store navigation">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Tienda
                    </p>
                    <ul className="flex w-full flex-col divide-y divide-neutral-100 border-y border-neutral-100">
                      <li>
                        <Link
                          href="/catalogo"
                          prefetch={true}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 py-4 text-lg font-medium text-black transition-colors hover:text-neutral-500"
                        >
                          <Squares2X2Icon className="h-5 w-5 text-neutral-500" />
                          Catálogo
                        </Link>
                      </li>
                    </ul>
                  </nav>

                  {customer && (
                  <nav aria-label="Account navigation">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Cuenta
                    </p>

                    <div className="space-y-4">
                        <div className="rounded-[12px] border border-neutral-100 bg-neutral-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                            Sesión iniciada
                          </p>
                          <p className="mt-1 truncate text-base font-medium text-black">
                            {customer.name}
                          </p>
                        </div>

                        <ul className="flex w-full flex-col divide-y divide-neutral-100 border-y border-neutral-100">
                          <li>
                            <Link
                              href="/perfil"
                              onClick={closeMobileMenu}
                              className="flex items-center gap-3 py-4 text-lg font-medium text-black transition-colors hover:text-neutral-500"
                            >
                              <UserCircleIcon className="h-5 w-5 text-neutral-500" />
                              Mi perfil
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/favoritos"
                              onClick={closeMobileMenu}
                              className="flex items-center gap-3 py-4 text-lg font-medium text-black transition-colors hover:text-neutral-500"
                            >
                              <HeartIcon className="h-5 w-5 text-neutral-500" />
                              Favoritos
                            </Link>
                          </li>
                          <li>
                            <LogoutButton
                              onBeforeLogout={closeMobileMenu}
                              className="flex w-full items-center gap-3 py-4 text-left text-lg font-medium text-red-600 transition-colors hover:text-red-700"
                            >
                              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                              Cerrar sesión
                            </LogoutButton>
                          </li>
                        </ul>
                      </div>
                  </nav>
                    )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
