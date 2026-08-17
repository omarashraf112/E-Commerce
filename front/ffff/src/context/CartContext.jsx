import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { CartApi } from "@/api/cart";
import { ProductApi } from "@/api/products";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const LOCAL_CART_KEY = "souqly_local_cart";

export function CartProvider({ children }) {
  const { isAuthenticated, isDashboardOnly } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Sellers/Admins don't shop — shopping enabled for customers and guests
  const shoppingEnabled = !isDashboardOnly;

  // Persist local cart
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  const refresh = useCallback(async () => {
    if (!shoppingEnabled) {
      setItems([]);
      return;
    }

    if (isAuthenticated) {
      setLoading(true);
      try {
        const data = await CartApi.get();
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else if (data?.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch {
        // Keep local cart if backend is unreachable
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated, shoppingEnabled]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    }
  }, [isAuthenticated, refresh]);

  const add = useCallback(
    async (productId, quantity = 1) => {
      if (isAuthenticated) {
        try {
          await CartApi.add(productId, quantity);
          await refresh();
          return;
        } catch {
          // Fall through to local update
        }
      }

      // Local cart fallback
      let product;
      try {
        product = await ProductApi.getById(productId);
      } catch {
        product = { id: productId, name: "Product", price: 50 };
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => String(item.productId ?? item.id) === String(productId)
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          const curr = updated[existingIndex];
          const newQty = (curr.quantity ?? curr.amount ?? 1) + quantity;
          updated[existingIndex] = {
            ...curr,
            quantity: newQty,
            amount: newQty,
            subtotal: newQty * curr.price,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              productId: product.id,
              productName: product.name,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: quantity,
              amount: quantity,
              subtotal: quantity * product.price,
            },
          ];
        }
      });
    },
    [isAuthenticated, refresh]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      if (quantity <= 0) {
        removeItem(cartItemId);
        return;
      }

      if (isAuthenticated) {
        try {
          await CartApi.updateQuantity(cartItemId, quantity);
          await refresh();
          return;
        } catch {
          // Fall through
        }
      }

      setItems((prev) =>
        prev.map((item) => {
          if (String(item.id) === String(cartItemId) || String(item.productId) === String(cartItemId)) {
            return {
              ...item,
              quantity,
              amount: quantity,
              subtotal: quantity * item.price,
            };
          }
          return item;
        })
      );
    },
    [isAuthenticated, refresh]
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      if (isAuthenticated) {
        try {
          await CartApi.removeItem(cartItemId);
          await refresh();
          return;
        } catch {
          // Fall through
        }
      }

      setItems((prev) =>
        prev.filter(
          (item) => String(item.id) !== String(cartItemId) && String(item.productId) !== String(cartItemId)
        )
      );
    },
    [isAuthenticated, refresh]
  );

  const clear = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await CartApi.clear();
      } catch {
        // Fall through
      }
    }
    setItems([]);
  }, [isAuthenticated]);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity ?? i.amount ?? 0), 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (i.subtotal ?? (i.price ?? 0) * (i.quantity ?? i.amount ?? 0)), 0),
    [items]
  );

  const value = {
    items,
    loading,
    count,
    total,
    refresh,
    add,
    updateQuantity,
    removeItem,
    clear,
    shoppingEnabled,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
