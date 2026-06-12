import { createContext, useContext, useState } from 'react';

// Context = spazio condiviso.
// Lo usiamo per far leggere lo stesso carrello a Menu, Navbar e Cart.
const CartContext = createContext(null);

function creaRigaCarrello(prodotto, quantita) {
    // Copiamo i dati del prodotto e aggiungiamo la quantita scelta.
    return {
        ...prodotto,
        quantita,
    };
}

function aggiungiProdotto(lista, prodotto) {
    const prodottoGiaPresente = lista.find(function cercaProdotto(item) {
        return item.id === prodotto.id;
    });

    if (!prodottoGiaPresente) {
        return [...lista, creaRigaCarrello(prodotto, 1)];
    }

    // map crea un nuovo array.
    // Cambiamo solo il prodotto cliccato, gli altri restano uguali.
    return lista.map(function aumentaQuantita(item) {
        if (item.id === prodotto.id) {
            return creaRigaCarrello(item, item.quantita + 1);
        }

        return item;
    });
}

function rimuoviUnaUnita(lista, prodottoId) {
    const prodottoGiaPresente = lista.find(function cercaProdotto(item) {
        return item.id === prodottoId;
    });

    if (!prodottoGiaPresente) {
        return lista;
    }

    if (prodottoGiaPresente.quantita === 1) {
        // filter crea un nuovo array tenendo solo i prodotti diversi da quello rimosso.
        return lista.filter(function rimuoviProdotto(item) {
            return item.id !== prodottoId;
        });
    }

    return lista.map(function diminuisciQuantita(item) {
        if (item.id === prodottoId) {
            return creaRigaCarrello(item, item.quantita - 1);
        }

        return item;
    });
}

export function CartProvider({ children }) {
    // cartItems e' l'array dei prodotti scelti dall'utente.
    const [cartItems, setCartItems] = useState([]);

    function addItem(prodotto) {
        setCartItems(function aggiornaCarrello(listaCorrente) {
            return aggiungiProdotto(listaCorrente, prodotto);
        });
    }

    function decreaseItem(prodottoId) {
        setCartItems(function aggiornaCarrello(listaCorrente) {
            return rimuoviUnaUnita(listaCorrente, prodottoId);
        });
    }

    function getQuantity(prodottoId) {
        const prodotto = cartItems.find(function cercaProdotto(item) {
            return item.id === prodottoId;
        });

        return prodotto ? prodotto.quantita : 0;
    }

    function clearCart() {
        setCartItems([]);
    }

    // reduce somma tutte le quantita e restituisce un solo numero.
    const totalQuantity = cartItems.reduce(function sommaQuantita(totale, item) {
        return totale + item.quantita;
    }, 0);

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
