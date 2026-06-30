import { apiFetch, readJson } from './client';

async function requestJson(path, options = {}, fallbackMessage = 'Richiesta non riuscita') {
    const risposta = await apiFetch(path, options);
    const dati = await readJson(risposta);

    if (!risposta.ok) {
        throw new Error(dati.message || fallbackMessage);
    }

    return dati;
}

export const orariPrenotazione = ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00'];

export async function caricaTavoli(orario) {
    const dati = await requestJson(`/api/tavoli?orario=${orario}`);
    return dati.tavoli || [];
}

export async function caricaMiePrenotazioni() {
    const dati = await requestJson('/api/tavoli/mie');
    return dati.prenotazioni || [];
}

export async function prenotaTavolo(numeroTavolo, orario) {
    return requestJson('/api/tavoli', {
        method: 'POST',
        body: JSON.stringify({ numeroTavolo, orario }),
    }, 'Prenotazione non riuscita');
}

export async function caricaPrenotazioniStaff() {
    const dati = await requestJson('/api/tavoli/staff');
    return dati.prenotazioni || [];
}

export async function eliminaPrenotazioneTavolo(prenotazioneId) {
    return requestJson(`/api/tavoli/staff/${prenotazioneId}`, {
        method: 'DELETE',
    }, 'Prenotazione non eliminata');
}
