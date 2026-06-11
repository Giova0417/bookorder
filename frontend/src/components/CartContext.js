import { createContext, useContext, useMemo, useState } from 'react';

// createContext crea un "contenitore globale" che può essere letto da qualsiasi componente
// nell'albero React senza passare props manualmente attraverso ogni livello.
// Il valore null è il default usato solo se qualcuno legge il context fuori dal Provider.
const CartContext = createContext(null);

// CartProvider è il componente che "avvolge" tutta l'app (in App.js) e rende
// le funzioni del carrello disponibili a ogni componente figlio.
export function CartProvider({ children }) {
    // Il carrello è salvato come oggetto { [id]: prodotto } invece di un array.
    // Questo permette di trovare e aggiornare un prodotto in O(1) tramite il suo id,
    // senza dover scorrere tutta la lista con find() o filter() ogni volta.
    const [items, setItems] = useState({});

    // Aggiunge un prodotto o aumenta la sua quantità di 1.
    // setItems riceve una funzione (prev => ...) invece di un valore diretto:
    // questo garantisce che lavoriamo sempre sullo stato più aggiornato,
    // evitando il problema delle "closure stantie" in React.
    const addItem = (prodotto) => {
        setItems((prev) => ({
            ...prev,
            [prodotto.id]: {
                ...prodotto,
                quantita: (prev[prodotto.id]?.quantita || 0) + 1,
            },
        }));
    };

    // Riduce la quantità di 1. Se la quantità arriva a 0, rimuove completamente il prodotto.
    // delete crea una copia dell'oggetto senza quella chiave — non modifica lo stato direttamente
    // (in React lo stato non va mai mutato, va sempre sostituito con una copia).
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

    // Restituisce la quantità di un prodotto specifico, oppure 0 se non è nel carrello.
    // Usata nel Menu per mostrare il numero accanto ai pulsanti + e −.
    const getQuantity = (prodottoId) => {
        return items[prodottoId]?.quantita || 0;
    };

    // Svuota completamente il carrello dopo che l'ordine è stato confermato.
    const clearCart = () => {
        setItems({});
    };

    // Object.values converte l'oggetto items in un array di prodotti,
    // che è più comodo da usare nei componenti con .map().
    const cartItems = Object.values(items);

    // useMemo ricalcola totalQuantity solo quando cartItems cambia,
    // evitando di sommare tutte le quantità a ogni render del componente.
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

// Hook personalizzato che semplifica l'accesso al context.
// Invece di scrivere useContext(CartContext) in ogni componente,
// si importa e chiama semplicemente useCart().
export function useCart() {
    return useContext(CartContext);
}
