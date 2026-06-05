import { apiFetch, readJson } from './client';

async function requestJson(path, options = {}, fallbackMessage = 'Richiesta non riuscita') {
  const risposta = await apiFetch(path, options);
  const dati = await readJson(risposta);

  if (!risposta.ok) {
    throw new Error(dati.message || fallbackMessage);
  }

  return dati;
}

export async function creaOrdine({ cartItems, numeroTavolo }) {
  return requestJson(
    '/api/order',
    {
      method: 'POST',
      body: JSON.stringify({ cartItems, numeroTavolo }),
    },
    'Ordine non registrato. Riprova.'
  );
}

export async function caricaOrdiniCliente() {
  const dati = await requestJson('/api/order', { method: 'GET' }, 'Ordini non disponibili');
  return dati.ordini || [];
}

export async function caricaOrdiniStaff() {
  const dati = await requestJson('/api/order/staff', { method: 'GET' }, 'Ordini staff non disponibili');
  return dati.ordini || [];
}

export async function aggiornaStatoOrdineStaff(ordineId, stato) {
  return requestJson(
    `/api/order/staff/${ordineId}/stato`,
    {
      method: 'PATCH',
      body: JSON.stringify({ stato }),
    },
    'Stato non aggiornato'
  );
}