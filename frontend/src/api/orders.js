import { apiFetch, readJson } from './client';

// Funzione privata — nessun export.
// Racchiude la logica ripetuta in tutte le chiamate API:
// fa la richiesta con apiFetch, parsa il JSON, e lancia un errore se la risposta non è ok.
// Così ogni funzione esportata sotto può essere scritta in 1-2 righe invece di ripetere sempre gli stessi 5 passaggi.
async function requestJson(path, options = {}, fallbackMessage = 'Richiesta non riuscita') {
    const risposta = await apiFetch(path, options);
    const dati = await readJson(risposta);

    if (!risposta.ok) {
        throw new Error(dati.message || fallbackMessage);
    }

    return dati;
}

export async function creaOrdine({ cartItems, numeroTavolo }) {
    return requestJson('/api/order', {
        method: 'POST',
        body: JSON.stringify({ cartItems, numeroTavolo }),
    }, 'Ordine non registrato. Riprova.');
}

// dati.ordini || [] garantisce che venga sempre restituito un array,
// anche se il server risponde senza il campo ordini.
export async function caricaOrdiniCliente() {
    const dati = await requestJson('/api/order');
    return dati.ordini || [];
}

export async function caricaOrdiniStaff() {
    const dati = await requestJson('/api/order/staff');
    return dati.ordini || [];
}

export async function aggiornaStatoOrdineStaff(ordineId, stato) {
    return requestJson(`/api/order/staff/${ordineId}/stato`, {
        method: 'PATCH',
        body: JSON.stringify({ stato }),
    }, 'Stato non aggiornato');
}
