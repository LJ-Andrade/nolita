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
  useContext,
  useMemo,
} from "react";
import { usePriceMode } from "components/price-mode/price-mode-context";
import { priceVariantForMode } from "lib/pricing";

type UpdateType = "plus" | "minus" | "delete";

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

  React.useEffect(() => {
    if (initialCart) {
      setCart(initialCart);
      return;
    }

    const storedCart = window.localStorage.getItem("nolita_guest_cart");
    setCart(storedCart ? JSON.parse(storedCart) : initialCart);
  }, [initialCart]);

  React.useEffect(() => {
    if (!cart || cart.id) return;
    window.localStorage.setItem("nolita_guest_cart", JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    setCart((currentCart) => {
      if (!currentCart) return currentCart;

      const updatedLines = currentCart.lines
        .map((item) => {
          const product = item.merchandise.product as CartItem["merchandise"]["product"];
          const unitAmount =
            priceMode === "wholesale"
              ? product.wholesalePrice ?? "0"
              : product.retailPrice ?? String(Number(item.cost.totalAmount.amount) / item.quantity);
          if (Number(unitAmount) <= 0) {
            return null;
          }
          const totalAmount = calculateItemCost(item.quantity, unitAmount);

          return {
            ...item,
            cost: {
              ...item.cost,
              totalAmount: {
                ...item.cost.totalAmount,
                amount: totalAmount,
              },
              compareAtTotalAmount: priceMode === "retail" ? item.cost.compareAtTotalAmount : null,
            },
            discount: priceMode === "retail" ? item.discount : 0,
            hasDiscount: priceMode === "retail" ? item.hasDiscount : false,
          };
        })
        .filter(Boolean) as CartItem[];

      return {
        ...currentCart,
        priceMode,
        lines: updatedLines,
        ...updateCartTotals(updatedLines),
      };
    });
  }, [priceMode]);

  const dispatchCartAction = (action: CartAction) => {
    setCart((currentCart) => cartReducer(currentCart, action));
  };

  const updateCartItem = (merchandiseId: string, updateType: UpdateType) => {
    dispatchCartAction({
      type: "UPDATE_ITEM",
      payload: { merchandiseId, updateType },
    });
  };

  const addCartItem = (
    variant: ProductVariant,
    product: Product,
    qty: number = 1,
  ) => {
    const pricedVariant = priceVariantForMode(variant, product, priceMode);
    dispatchCartAction({
      type: "ADD_ITEM",
      payload: { variant: pricedVariant, product, qty },
    });
  };

  const addMultipleCartItems = (
    variants: ProductVariant[],
    product: Product,
  ) => {
    const pricedVariants = variants.map((variant) =>
      priceVariantForMode(variant, product, priceMode),
    );
    dispatchCartAction({
      type: "ADD_MULTIPLE_ITEMS",
      payload: { variants: pricedVariants, product },
    });
  };

  const clearCart = () => {
    window.localStorage.removeItem("nolita_guest_cart");
    dispatchCartAction({ type: "CLEAR_CART" });
  };

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
    [cart, isOpen, setIsOpen],
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
