"use client";

import type {
  Cart,
  CartItem,
  Product,
  ProductVariant,
} from "lib/vadmin/types";

import React, {
  createContext,
  use,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { usePriceMode, type PriceMode } from "components/price-mode/price-mode-context";
import { priceVariantForMode } from "lib/pricing";

type UpdateType = "plus" | "minus" | "delete";

const GUEST_CART_KEY = "nolita_guest_cart";

function readGuestCart(): Cart | undefined {
  try {
    const stored = window.localStorage.getItem(GUEST_CART_KEY);
    return stored ? (JSON.parse(stored) as Cart) : undefined;
  } catch {
    // A corrupt or unreadable value must not break the store layout.
    return undefined;
  }
}

function writeGuestCart(cart: Cart) {
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    // Storage can be unavailable (private mode, quota). The in-memory cart still works.
  }
}

function clearGuestCart() {
  try {
    window.localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // Ignored: see writeGuestCart.
  }
}

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: { merchandiseId: string; updateType: UpdateType };
    }
  | {
      type: "ADD_ITEM";
      payload: { variant: ProductVariant; product: Product; qty?: number };
    }
  | {
      type: "ADD_MULTIPLE_ITEMS";
      payload: { variants: ProductVariant[]; product: Product };
    }
  | {
      type: "CLEAR_CART";
    };

type CartContextType = {
  cart: Cart | undefined;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => void;
  addCartItem: (variant: ProductVariant, product: Product, qty?: number) => void;
  addMultipleCartItems: (variants: ProductVariant[], product: Product) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function calculateDiscountedPrice(price: string | null | undefined, discount: number | null | undefined): string {
  const numericPrice = Number(price ?? 0);
  const safeDiscount = Math.min(Math.max(Number(discount ?? 0), 0), 100);

  return String(Math.round(numericPrice * (1 - safeDiscount / 100) * 100) / 100);
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType,
): CartItem | null {
  if (updateType === "delete") return null;
  if (
    updateType === "plus" &&
    item.merchandise.product.stock !== undefined &&
    item.merchandise.product.stock <= 0
  ) {
    return item;
  }

  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const singleCompareAtAmount = item.cost.compareAtTotalAmount
    ? Number(item.cost.compareAtTotalAmount.amount) / item.quantity
    : null;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString(),
  );
  const newCompareAtTotalAmount = singleCompareAtAmount
    ? calculateItemCost(newQuantity, singleCompareAtAmount.toString())
    : null;

  const stockDelta = updateType === "plus" ? -1 : 1;

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
      compareAtTotalAmount: item.cost.compareAtTotalAmount && newCompareAtTotalAmount
        ? {
            ...item.cost.compareAtTotalAmount,
            amount: newCompareAtTotalAmount,
          }
        : null,
    },
    merchandise: {
      ...item.merchandise,
      product: {
        ...item.merchandise.product,
        stock: (item.merchandise.product.stock ?? 0) + stockDelta,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  qty: number = 1,
): CartItem {
  const quantity = existingItem ? existingItem.quantity + qty : qty;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);
  const compareAtTotalAmount = variant.compareAtPrice
    ? calculateItemCost(quantity, variant.compareAtPrice.amount)
    : null;
  const currentStock =
    existingItem?.merchandise.product.stock ?? variant.quantityAvailable;
  const remainingStock =
    currentStock === undefined ? undefined : Math.max(currentStock - qty, 0);

  return {
    id: existingItem?.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
      compareAtTotalAmount: variant.compareAtPrice && compareAtTotalAmount
        ? {
            amount: compareAtTotalAmount,
            currencyCode: variant.compareAtPrice.currencyCode,
          }
        : null,
    },
    discount: variant.discount,
    hasDiscount: variant.hasDiscount,
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        stock: remainingStock,
        featuredImage: product.featuredImage,
        colorImages: product.colorImages,
        salePrice: product.salePrice,
        retailPrice: product.priceRange.minVariantPrice.amount,
        wholesalePrice: product.wholesalePrice,
        retailDiscount: product.retailDiscount ?? product.discount,
        wholesaleDiscount: product.wholesaleDiscount,
        hideOnWholesale: product.hideOnWholesale,
      },
    },
  };
}

function updateCartTotals(
  lines: CartItem[],
): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0,
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "USD";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "USD" },
      totalAmount: { amount: "0", currencyCode: "USD" },
      totalTaxAmount: { amount: "0", currencyCode: "USD" },
    },
  };
}

/**
 * Recalculate every line for the given price mode. Pure, so it can be applied
 * both to local price-mode changes and to carts arriving from another tab.
 */
function repriceCart(
  cart: Cart | undefined,
  priceMode: PriceMode,
): Cart | undefined {
  if (!cart) return cart;

  const updatedLines = cart.lines
    .map((item) => {
      const product = item.merchandise.product as CartItem["merchandise"]["product"];
      const discount =
        priceMode === "wholesale"
          ? product.wholesaleDiscount ?? 0
          : product.retailDiscount ?? item.discount ?? 0;
      const baseAmount =
        priceMode === "wholesale"
          ? product.wholesalePrice ?? "0"
          : product.salePrice ?? product.retailPrice ?? String(Number(item.cost.totalAmount.amount) / item.quantity);
      const unitAmount =
        priceMode === "wholesale"
          ? calculateDiscountedPrice(baseAmount, discount)
          : product.retailPrice ?? calculateDiscountedPrice(baseAmount, discount);
      if (Number(unitAmount) <= 0) {
        return null;
      }
      const totalAmount = calculateItemCost(item.quantity, unitAmount);
      const hasDiscount = Number(discount) > 0 && Number(unitAmount) < Number(baseAmount);

      return {
        ...item,
        cost: {
          ...item.cost,
          totalAmount: {
            ...item.cost.totalAmount,
            amount: totalAmount,
          },
          compareAtTotalAmount: hasDiscount
            ? {
                amount: calculateItemCost(item.quantity, baseAmount),
                currencyCode: item.cost.totalAmount.currencyCode,
              }
            : null,
        },
        discount,
        hasDiscount,
      };
    })
    .filter(Boolean) as CartItem[];

  return {
    ...cart,
    priceMode,
    lines: updatedLines,
    ...updateCartTotals(updatedLines),
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  switch (action.type) {
    case "CLEAR_CART": {
      return createEmptyCart();
    }
    case "UPDATE_ITEM": {
      const { merchandiseId, updateType } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) =>
          item.merchandise.id === merchandiseId
            ? updateCartItem(item, updateType)
            : item,
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: "0" },
          },
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product, qty } = action.payload;
      const existingItem = currentCart.lines.find(
        (item) => item.merchandise.id === variant.id,
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        qty,
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            item.merchandise.id === variant.id ? updatedItem : item,
          )
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_MULTIPLE_ITEMS": {
      const { variants, product } = action.payload;
      let updatedLines = [...currentCart.lines];

      for (const variant of variants) {
        const existingItemIndex = updatedLines.findIndex(
          (item) => item.merchandise.id === variant.id,
        );
        const existingItem =
          existingItemIndex >= 0 ? updatedLines[existingItemIndex] : undefined;
        const updatedItem = createOrUpdateCartItem(
          existingItem,
          variant,
          product,
        );

        if (existingItemIndex >= 0) {
          updatedLines[existingItemIndex] = updatedItem;
        } else {
          updatedLines.push(updatedItem);
        }
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
}

export function CartProvider({
  children,
  cartPromise,
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { priceMode } = usePriceMode();
  const initialCart = use(cartPromise);
  const [cart, setCart] = React.useState<Cart | undefined>(initialCart);
  const cartRef = useRef<Cart | undefined>(initialCart);
  // Authenticated carts live in VADMIN; only guest carts are persisted locally.
  const isGuestCart = !initialCart;

  const commitCart = useCallback(
    (next: Cart | undefined, persist: boolean) => {
      cartRef.current = next;
      setCart(next);

      if (!persist || !isGuestCart) return;

      if (next) {
        writeGuestCart(next);
      } else {
        clearGuestCart();
      }
    },
    [isGuestCart],
  );

  /**
   * Apply a mutation on top of the persisted cart instead of the in-memory
   * snapshot, which may be stale when another tab has written since. Without
   * this, the last tab to write silently erases the other tab's items.
   */
  const applyGuestUpdate = useCallback(
    (reduce: (base: Cart | undefined) => Cart | undefined) => {
      const base = isGuestCart ? readGuestCart() ?? cartRef.current : cartRef.current;
      commitCart(reduce(base), true);
    },
    [commitCart, isGuestCart],
  );

  React.useEffect(() => {
    commitCart(initialCart ?? readGuestCart(), false);
  }, [commitCart, initialCart]);

  // Pick up writes made by other tabs. The `storage` event only fires in tabs
  // other than the writer, so there is no echo back to the origin tab.
  React.useEffect(() => {
    if (!isGuestCart) return;

    const handleStorage = (event: StorageEvent) => {
      // A null key means localStorage.clear() was called.
      if (event.key !== null && event.key !== GUEST_CART_KEY) return;

      const stored = readGuestCart();
      // Reprice for display only. Writing back here would make two tabs echo
      // storage events at each other indefinitely.
      commitCart(stored ? repriceCart(stored, priceMode) : createEmptyCart(), false);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [commitCart, isGuestCart, priceMode]);

  React.useEffect(() => {
    applyGuestUpdate((base) => repriceCart(base, priceMode));
  }, [applyGuestUpdate, priceMode]);

  const dispatchCartAction = useCallback(
    (action: CartAction) => {
      applyGuestUpdate((base) => cartReducer(base, action));
    },
    [applyGuestUpdate],
  );

  const updateCartItem = useCallback(
    (merchandiseId: string, updateType: UpdateType) => {
      dispatchCartAction({
        type: "UPDATE_ITEM",
        payload: { merchandiseId, updateType },
      });
    },
    [dispatchCartAction],
  );

  const addCartItem = useCallback(
    (variant: ProductVariant, product: Product, qty: number = 1) => {
      const pricedVariant = priceVariantForMode(variant, product, priceMode);
      dispatchCartAction({
        type: "ADD_ITEM",
        payload: { variant: pricedVariant, product, qty },
      });
    },
    [dispatchCartAction, priceMode],
  );

  const addMultipleCartItems = useCallback(
    (variants: ProductVariant[], product: Product) => {
      const pricedVariants = variants.map((variant) =>
        priceVariantForMode(variant, product, priceMode),
      );
      dispatchCartAction({
        type: "ADD_MULTIPLE_ITEMS",
        payload: { variants: pricedVariants, product },
      });
    },
    [dispatchCartAction, priceMode],
  );

  const clearCart = useCallback(() => {
    clearGuestCart();
    commitCart(createEmptyCart(), false);
  }, [commitCart]);

  const value = useMemo(
    () => ({
      cart,
      updateCartItem,
      addCartItem,
      addMultipleCartItems,
      clearCart,
      isOpen,
      setIsOpen,
    }),
    [
      cart,
      updateCartItem,
      addCartItem,
      addMultipleCartItems,
      clearCart,
      isOpen,
      setIsOpen,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
