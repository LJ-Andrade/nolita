"use client";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { NewsletterPopupConfig } from "lib/vadmin/types";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "./actions";

const SESSION_KEY = "nolita_newsletter_shown";
const DISMISS_KEY = "nolita_newsletter_dismissed";

function safeGet(storage: "session" | "local", key: string): string | null {
  try {
    const store = storage === "session" ? sessionStorage : localStorage;
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: "session" | "local", key: string, value: string) {
  try {
    const store = storage === "session" ? sessionStorage : localStorage;
    store.setItem(key, value);
  } catch {
    // Storage unavailable, ignore.
  }
}

export default function NewsletterPopup({
  config,
}: {
  config: NewsletterPopupConfig;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"minorista" | "mayorista" | "">("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!config?.is_enabled) return;
    if (safeGet("local", DISMISS_KEY)) return;
    if (safeGet("session", SESSION_KEY)) return;

    const delay = Math.max(0, (config.delay_seconds ?? 3) * 1000);
    const timer = setTimeout(() => {
      setIsOpen(true);
      safeSet("session", SESSION_KEY, "1");
    }, delay);

    return () => clearTimeout(timer);
  }, [config]);

  const close = () => setIsOpen(false);

  const handleDismissForever = (checked: boolean) => {
    if (checked) {
      safeSet("local", DISMISS_KEY, "1");
      close();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Completá tu nombre y tu correo.");
      return;
    }
    if (!mode) {
      toast.error("Seleccioná si sos Minorista o Mayorista.");
      return;
    }

    setSubmitting(true);
    const result = await subscribeToNewsletter({ name, email, mode });
    setSubmitting(false);

    if (result.success) {
      toast.success("¡Listo! Te vas a enterar de todo primero.");
      close();
    } else {
      toast.error(result.error || "Ocurrió un error.");
    }
  };

  const inputClass =
    "w-full border border-bone bg-parchment px-4 py-3 text-sm text-black placeholder:text-khaki-beige focus:outline-none focus:ring-1 focus:ring-graphite";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={close} className="relative z-[100]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative w-full max-w-lg rounded-2xl bg-parchment p-8 shadow-2xl sm:p-10">
              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-4 text-black/60 transition-colors hover:text-black"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {config.title ? (
                <Dialog.Title className="text-center text-2xl font-bold text-black">
                  {config.title}
                </Dialog.Title>
              ) : null}

              {config.subtitle ? (
                <Dialog.Description className="mt-3 text-center text-sm leading-relaxed text-stone-brown">
                  {config.subtitle}
                </Dialog.Description>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="flex flex-col gap-1">
                  {config.name_label ? (
                    <label
                      htmlFor="newsletter-name"
                      className="text-sm font-medium text-black"
                    >
                      {config.name_label}
                    </label>
                  ) : null}
                  <input
                    id="newsletter-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={config.name_placeholder ?? ""}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  {config.email_label ? (
                    <label
                      htmlFor="newsletter-email"
                      className="text-sm font-medium text-black"
                    >
                      {config.email_label}
                    </label>
                  ) : null}
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={config.email_placeholder ?? ""}
                    className={inputClass}
                    required
                  />
                </div>

                {config.customer_type_text ? (
                  <p className="text-xs leading-relaxed text-stone-brown">
                    {config.customer_type_text}
                  </p>
                ) : null}

                <div className="flex items-center gap-6">
                  <span className="text-sm font-semibold text-black">Soy:</span>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-black">
                    <input
                      type="radio"
                      name="newsletter-mode"
                      checked={mode === "minorista"}
                      onChange={() => setMode("minorista")}
                      className="h-4 w-4 accent-graphite"
                    />
                    Minorista
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-black">
                    <input
                      type="radio"
                      name="newsletter-mode"
                      checked={mode === "mayorista"}
                      onChange={() => setMode("mayorista")}
                      className="h-4 w-4 accent-graphite"
                    />
                    Mayorista
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "var(--pb-filter-accent)" }}
                >
                  {submitting ? "Enviando..." : config.submit_text}
                </button>

                <label className="flex cursor-pointer items-center justify-center gap-2 pt-1 text-xs text-stone-brown">
                  <input
                    type="checkbox"
                    onChange={(e) => handleDismissForever(e.target.checked)}
                    className="h-3.5 w-3.5 accent-graphite"
                  />
                  {config.dismiss_text || "No mostrar más"}
                </label>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
