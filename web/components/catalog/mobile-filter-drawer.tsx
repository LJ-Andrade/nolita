"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FilterSidebar } from "components/catalog/filter-sidebar";
import type { Collection } from "lib/vadmin/types";
import { useState } from "react";

type MobileFilterDrawerProps = {
  categories: Collection[];
  sizes: string[];
};

export function MobileFilterDrawer({ categories, sizes }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 border px-3 text-xs font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-70 lg:hidden"
        style={{
          borderColor: "var(--pb-border)",
          color: "var(--pb-text)",
          borderRadius: "var(--pb-radius)",
        }}
      >
        <FunnelIcon className="h-4 w-4" />
        Filtros
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/35" />
        <div className="fixed inset-0 flex items-end">
          <DialogPanel
            className="max-h-[86vh] w-full overflow-y-auto bg-[var(--pb-bg)] px-5 pb-6 pt-4 shadow-2xl"
            style={{
              borderTopLeftRadius: "var(--pb-radius)",
              borderTopRightRadius: "var(--pb-radius)",
            }}
          >
            <div
              className="mb-2 flex items-center justify-between border-b pb-4"
              style={{ borderColor: "var(--pb-border)" }}
            >
              <DialogTitle
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--pb-text)" }}
              >
                Filtros
              </DialogTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
                aria-label="Cerrar filtros"
                style={{ color: "var(--pb-text)" }}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <FilterSidebar
              categories={categories}
              sizes={sizes}
              layout="mobile"
              footer={
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-2 h-11 w-full text-xs font-semibold uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "var(--pb-accent)",
                    borderRadius: "var(--pb-radius)",
                  }}
                >
                  Ver resultados
                </button>
              }
            />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
