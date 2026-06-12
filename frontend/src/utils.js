// Funzioni di utilità condivise tra più componenti.
// Le definiamo qui per evitare di copiarle in ogni file:
// se dobbiamo cambiarle, lo facciamo in un solo posto.

// Formatta un numero come prezzo in formato europeo.
// toFixed(2) arrotonda a 2 decimali → replace sostituisce il punto con la virgola.
// Esempio: 7.5 → "7,50 EUR"
export function formatPrice(price) {
    return `${price.toFixed(2).replace('.', ',')} EUR`;
}

// Calcola il totale di un array di prodotti (cartItems).
// reduce è una funzione di ordine superiore: riceve una funzione accumulatrice
// e un valore iniziale (0), e la applica su ogni elemento dell'array.
// Ad ogni iterazione, totale cresce sommando prezzo × quantità del prodotto corrente.
export function calcolaTotale(items) {
    return items.reduce(function sommaTotale(totale, item) {
        return totale + item.prezzo * item.quantita;
    }, 0);
}

// Wrapper comodo per calcolare il totale di un ordine completo.
export function totaleOrdine(ordine) {
    return calcolaTotale(ordine.cartItems);
}

// Restituisce una copia dell'ordine con il campo stato aggiornato.
// Lo spread operator (...ordine) copia tutti i campi esistenti,
// poi stato: nuovoStato sovrascrive solo il campo stato.
// Non modifichiamo mai l'oggetto originale: React rileva i cambiamenti
// solo su oggetti nuovi, non su modifiche dirette a quelli esistenti.
export function copiaOrdineConNuovoStato(ordine, nuovoStato) {
    return { ...ordine, stato: nuovoStato };
}
