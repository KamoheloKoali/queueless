"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity: number;
};

type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "queueless.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem: (itemInput) => {
        const nextQuantity = Math.max(1, itemInput.quantity ?? 1);
        setItems((current) => {
          const existing = current.find((item) => item.productId === itemInput.productId);
          if (existing) {
            return current.map((item) =>
              item.productId === itemInput.productId
                ? { ...item, quantity: item.quantity + nextQuantity }
                : item,
            );
          }

          return [
            ...current,
            {
              productId: itemInput.productId,
              name: itemInput.name,
              price: itemInput.price,
              imageUrl: itemInput.imageUrl,
              category: itemInput.category,
              quantity: nextQuantity,
            },
          ];
        });
      },
      updateItemQuantity: (productId, quantity) => {
        const nextQuantity = Math.max(1, quantity);
        setItems((current) =>
          current.map((item) =>
            item.productId === productId ? { ...item, quantity: nextQuantity } : item,
          ),
        );
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clearCart: () => {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

export type { CartItem, AddCartItemInput };
