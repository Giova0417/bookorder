import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState({});

    const addItem = (prodotto) => {
        setItems((prev) => ({
            ...prev,
            [prodotto.id]: {
                ...prodotto,
                quantita: (prev[prodotto.id]?.quantita || 0) + 1,
            },
        }));
    };

    const decreaseItem = (prodottoId) => {
        setItems((prev) => {
            const current = prev[prodottoId];

            if (!current) return prev;

            if (current.quantita <= 1) {
                const updated = { ...prev };
                delete updated[prodottoId];
                return updated;
            }

            return {
                ...prev,
                [prodottoId]: {
                    ...current,
                    quantita: current.quantita - 1,
                },
            };
        });
    };

    const getQuantity = (prodottoId) => {
        return items[prodottoId]?.quantita || 0;
    };

    const clearCart = () => {
        setItems({});
    };

    const cartItems = Object.values(items);

    const totalQuantity = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantita, 0);
    }, [cartItems]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addItem,
                decreaseItem,
                getQuantity,
                totalQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
