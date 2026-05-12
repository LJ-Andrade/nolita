"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function PasswordInput() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name="password"
        type={isVisible ? "text" : "password"}
        required
        className="w-full border-b border-neutral-200 bg-transparent py-3 pr-10 text-sm outline-none transition-colors focus:border-black"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-neutral-500 transition-colors hover:text-black"
        aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {isVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
