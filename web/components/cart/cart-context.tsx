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

  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString(),
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
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

  return {
    id: existingItem?.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
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
  const initialCart = use(cartPromise);
  const [cart, setCart] = React.useState<Cart | undefined>(initialCart);

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
    dispatchCartAction({
      type: "ADD_ITEM",
      payload: { variant, product, qty },
    });
  };

  const addMultipleCartItems = (
    variants: ProductVariant[],
    product: Product,
  ) => {
    dispatchCartAction({
      type: "ADD_MULTIPLE_ITEMS",
      payload: { variants, product },
    });
  };

  const clearCart = () => {
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
