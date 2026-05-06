"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { logoutAction } from "lib/vadmin/actions";
import { ConfirmDialog } from "components/ui/confirm-dialog";

export default function UserMenu({ customer }: { customer: any }) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a manual SVG to ensure visibility with fixed black color
  const UserIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="#000000" 
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  if (!customer) {
    return (
      <Link
        href="/login"
        className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-black transition-colors hover:bg-neutral-50 shadow-sm"
      >
        <UserIcon />
      </Link>
    );
  }

  // Prevent hydration mismatch by not rendering Menu until mounted
  if (!mounted) {
    return (
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[12px] bg-white shadow-sm">
        <UserIcon />
      </div>
    );
  }

  return (
    <>
      <Menu as="div" className="relative">
        <div>
          <MenuButton className="relative flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 overflow-hidden hover:bg-neutral-50 transition-colors shadow-sm">
            <span className="sr-only">Open user menu</span>
            {customer.avatar_url ? (
              <img
                alt={customer.name}
                src={customer.avatar_url}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon />
            )}
          </MenuButton>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-[12px] bg-white py-1 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] focus:outline-none">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Cuenta</p>
              <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
            </div>
            <MenuItem>
              {({ focus }) => (
                <Link
                  href="/perfil"
                  className={`${focus ? "bg-gray-50 text-black" : "text-gray-600"} block px-4 py-2 text-sm transition-colors`}
                >
                  Mi Perfil
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <Link
                  href="/favoritos"
                  className={`${focus ? "bg-gray-50 text-black" : "text-gray-600"} block px-4 py-2 text-sm transition-colors`}
                >
                  Favoritos
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className={`${focus ? "bg-gray-50 text-red-600" : "text-gray-600"} block w-full text-left px-4 py-2 text-sm transition-colors`}
                >
                  Cerrar Sesión
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => logoutAction()}
        title="¿Cerrar sesión?"
        description="Tendrás que volver a ingresar tus credenciales para acceder a tu cuenta."
        confirmLabel="Cerrar Sesión"
        cancelLabel="Volver"
        variant="danger"
      />
    </>
  );
}
