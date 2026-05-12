"use client";

import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useState } from "react";
import { LogoutButton } from "./logout-button";

// Manual Icons with forced black color
const BarsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

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
        className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-neutral-200 text-black transition-colors md:hidden dark:border-neutral-700"
      >
        <BarsIcon />
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
            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col bg-white pb-6 dark:bg-black">
              <div className="p-4">
                <button
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-neutral-200 text-black transition-colors dark:border-neutral-700"
                  onClick={closeMobileMenu}
                  aria-label="Close mobile menu"
                >
                  <XIcon />
                </button>

                <ul className="flex w-full flex-col">
                  <li className="py-2 text-xl text-black transition-colors hover:text-neutral-500 dark:text-white">
                    <Link href="/catalogo" prefetch={true} onClick={closeMobileMenu}>
                      Catálogo
                    </Link>
                  </li>
                  <li className="py-2 text-xl text-black transition-colors hover:text-neutral-500 dark:text-white border-t mt-4 pt-4">
                    {customer ? (
                      <>
                        <Link href="/perfil" onClick={closeMobileMenu} className="block mb-2 font-medium">
                          Mi Perfil
                        </Link>
                        <LogoutButton
                          onBeforeLogout={closeMobileMenu}
                          className="text-left w-full text-red-500 font-medium"
                        >
                          Cerrar Sesión
                        </LogoutButton>
                      </>
                    ) : (
                      <Link href="/ingreso" onClick={closeMobileMenu} className="font-medium">
                        Ingresar
                      </Link>
                    )}
                  </li>
                </ul>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
