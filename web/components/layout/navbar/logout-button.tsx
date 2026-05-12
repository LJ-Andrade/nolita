"use client";

import { useCart } from "components/cart/cart-context";
import { logoutAction } from "lib/vadmin/actions";
import { useTransition } from "react";

type LogoutButtonProps = {
  children: React.ReactNode;
  className?: string;
  onBeforeLogout?: () => void;
};

export function LogoutButton({
  children,
  className,
  onBeforeLogout,
}: LogoutButtonProps) {
  const { clearCart, setIsOpen } = useCart();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        clearCart();
        setIsOpen(false);
        onBeforeLogout?.();
        startTransition(() => {
          logoutAction();
        });
      }}
      className={className}
    >
      {children}
    </button>
  );
}
