"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState } from "react";

type Locality = { id: number; name: string; province_id: number };

// With no query we show the first N localities by name; typing triggers a
// debounced server-side search. This keeps the field fast even for provinces
// with hundreds of localities.
const DEFAULT_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 250;

export default function LocalityCombobox({
  provinceId,
  value,
  initialLabel = "",
  onChange,
  inputId,
  inputClassName = "",
  disabled = false,
}: {
  provinceId: string;
  value: string;
  initialLabel?: string;
  onChange: (id: string, name: string) => void;
  inputId?: string;
  inputClassName?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Locality | null>(null);

  // Keep the displayed selection in sync with the controlled value. When the
  // label is unknown (e.g. a returning customer whose saved locality is not in
  // the default page) we resolve it by id.
  useEffect(() => {
    if (!value || !provinceId) {
      setSelected(null);
      return;
    }
    if (selected && String(selected.id) === value) return;
    if (initialLabel) {
      setSelected({
        id: Number(value),
        name: initialLabel,
        province_id: Number(provinceId),
      });
      return;
    }

    let cancelled = false;
    fetch(`/api/localities?province_id=${provinceId}&id=${value}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Locality[]) => {
        if (!cancelled && Array.isArray(data) && data[0]) setSelected(data[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, provinceId, initialLabel]);

  // Fetch the option list: default page when empty, search results otherwise.
  useEffect(() => {
    if (!provinceId || disabled) {
      setOptions([]);
      return;
    }

    let cancelled = false;
    const trimmed = query.trim();
    setLoading(true);
    const handle = setTimeout(
      () => {
        const params = new URLSearchParams({
          province_id: provinceId,
          perPage: String(DEFAULT_LIMIT),
        });
        if (trimmed) params.set("search", trimmed);

        fetch(`/api/localities?${params.toString()}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((data: Locality[]) => {
            if (!cancelled) setOptions(Array.isArray(data) ? data : []);
          })
          .catch(() => {
            if (!cancelled) setOptions([]);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      trimmed ? SEARCH_DEBOUNCE_MS : 0,
    );

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [provinceId, query, disabled]);

  return (
    <Combobox
      value={selected}
      onChange={(loc: Locality | null) => {
        setSelected(loc);
        onChange(loc ? String(loc.id) : "", loc?.name ?? "");
      }}
      disabled={disabled}
    >
      <div className="relative">
        <ComboboxInput
          id={inputId}
          autoComplete="off"
          className={inputClassName}
          placeholder={
            disabled ? "Seleccioná una provincia" : "Buscá tu localidad"
          }
          displayValue={(loc: Locality | null) => loc?.name ?? ""}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto border border-bone bg-parchment text-sm shadow-lg empty:hidden">
          {loading && (
            <div className="px-4 py-2 text-stone-brown">Buscando...</div>
          )}
          {!loading && options.length === 0 && (
            <div className="px-4 py-2 text-stone-brown">Sin resultados</div>
          )}
          {!loading &&
            options.map((loc) => (
              <ComboboxOption
                key={loc.id}
                value={loc}
                className="cursor-pointer px-4 py-2 data-[focus]:bg-bone/40 data-[selected]:font-bold"
              >
                {loc.name}
              </ComboboxOption>
            ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
