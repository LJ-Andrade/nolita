"use client";

import clsx from "clsx";
import { COLOR_MAP } from "lib/constants";
import { ProductOption, ProductVariant } from "lib/vadmin/types";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

export function VariantSelector({
  options,
  variants,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.name.toLowerCase()]: option.value,
      }),
      {},
    ),
  }));

  const updateOption = (name: string, value: string, isAvailable: boolean) => {
    if (!isAvailable) {
      toast.error("Combinación sin stock", {
        description:
          "Lo sentimos, la variante seleccionada no tiene unidades disponibles en este momento.",
      });
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return options.map((option) => {
    const optionNameLowerCase = option.name.toLowerCase();
    const isColor = optionNameLowerCase === "color";
    const selectedValue = searchParams.get(optionNameLowerCase);

    return (
      <div key={option.id} className={isColor ? "mb-7" : "mb-5"}>
        <dl>
          <dt className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-black">
            {isColor ? (
              <>
                Color
                {selectedValue ? <span>: {selectedValue}</span> : null}
              </>
            ) : (
              option.name
            )}
          </dt>
          <dd
            className={clsx("flex flex-wrap", isColor ? "gap-2.5" : "gap-2.5")}
          >
            {option.values.map((value, index) => {
              const optionParams: Record<string, string> = {};
              searchParams.forEach((v, k) => (optionParams[k] = v));
              optionParams[optionNameLowerCase] = value;

              const filtered = Object.entries(optionParams).filter(
                ([key, optionValue]) =>
                  options.find(
                    (productOption) =>
                      productOption.name.toLowerCase() === key &&
                      productOption.values.includes(optionValue),
                  ),
              );

              const isAvailableForSale = combinations.find((combination) =>
                filtered.every(
                  ([key, optionValue]) =>
                    combination[key] === optionValue &&
                    combination.availableForSale,
                ),
              );
              const isActive =
                selectedValue?.toLowerCase() === value.toLowerCase();
              const colorHex =
                option.hexValues?.[index] ??
                COLOR_MAP[value.toLowerCase()] ??
                "#CCCCCC";

              return (
                <button
                  onClick={() =>
                    updateOption(
                      optionNameLowerCase,
                      value,
                      !!isAvailableForSale,
                    )
                  }
                  key={value}
                  aria-disabled={!isAvailableForSale}
                  title={`${option.name} ${value}${
                    !isAvailableForSale ? " (Sin stock)" : ""
                  }`}
                  className={clsx(
                    "relative flex items-center justify-center transition-all duration-200",
                    isColor
                      ? "h-7 w-7 rounded-full border text-transparent"
                      : "h-10 min-w-10 border px-3 text-xs font-medium uppercase tracking-[0.04em]",
                    isActive && !isColor && "border-black bg-white text-black",
                    !isActive &&
                      !isColor &&
                      "border-neutral-300 bg-white text-black hover:border-black",
                    isActive && isColor
                      ? "border-black ring-1 ring-black ring-offset-2"
                      : isColor &&
                          "border-black hover:ring-1 hover:ring-black hover:ring-offset-2",
                    !isAvailableForSale &&
                      "cursor-not-allowed overflow-hidden opacity-35 before:absolute before:inset-x-0 before:h-px before:-rotate-45 before:bg-neutral-300",
                  )}
                  style={isColor ? { backgroundColor: colorHex } : undefined}
                >
                  {!isColor && value}
                </button>
              );
            })}
          </dd>
        </dl>
      </div>
    );
  });
}
