import { createContext, useContext, useMemo, useState } from "react";
import type { Item } from "../components/menu/Menu";

/* ================= Types ================= */

export interface CartItem extends Item {
    qty: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Item) => void;
    increase: (id: string) => void;
    decrease: (id: string) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

/* ================= Context ================= */

const CartContext = createContext<CartContextType | null>(null);

/* ================= Provider ================= */

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    /* إضافة صنف */
    const addItem = (item: Item) => {
        setItems(prev => {
            const found = prev.find(i => i.id === item.id);
            if (found) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    /* زيادة */
    const increase = (id: string) => {
        setItems(prev =>
            prev.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        );
    };

    /* نقصان */
    const decrease = (id: string) => {
        setItems(prev =>
            prev
                .map(i => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
                .filter(i => i.qty > 0)
        );
    };

    /* حذف */
    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    /* تفريغ */
    const clearCart = () => setItems([]);

    /* مجموع الكميات */
    const totalItems = useMemo(
        () => items.reduce((sum, i) => sum + i.qty, 0),
        [items]
    );

    /* مجموع السعر */
    const totalPrice = useMemo(
        () =>
            items.reduce((sum, i) => {
                const price = Number(
                    String(i.price).split(",")[0].trim()
                );
                return sum + price * i.qty;
            }, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                increase,
                decrease,
                removeItem,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

/* ================= Hook ================= */

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return ctx;
}
