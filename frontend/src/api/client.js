// client.js è la fondazione del layer API: gestisce il token JWT in localStorage,
// costruisce gli header Authorization per ogni richiesta,
// e implementa il silent refresh — se una richiesta riceve 401 (token scaduto),
// rinnova automaticamente il token e riprova la richiesta senza che l'utente se ne accorga.
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ACCESS_TOKEN_STORAGE_KEY = 'token';

// Tre funzioni che incapsulano localStorage.
// localStorage è una Browser Web API che permette di salvare dati persistenti nel browser.
// Il if (token) in saveAccessToken è una guardia: evita di salvare undefined se il server risponde senza token.
// L'access token sta in localStorage (non in un cookie) perché dura solo 15 minuti.
// Il refresh token invece — più pericoloso perché dura 7 giorni — sta in un cookie HttpOnly,
// inaccessibile a JavaScript, quindi al sicuro da attacchi XSS.
export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function saveAccessToken(token) {
    if (token) {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    }
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

// risposta.json() parsa il body HTTP come JSON.
// Il .catch(() => ({})) è una protezione: se il server risponde con un body vuoto o non-JSON
// (per esempio un 500 generico senza corpo), risposta.json() lancerebbe un errore.
// Il catch restituisce un oggetto vuoto, permettendo al codice successivo di gestire l'errore con risposta.ok.
// Nota: fetch non rigetta la Promise per errori HTTP — rigetta solo per errori di rete.
// Quindi un 500 dal server non va nel catch — arriva con risposta.ok = false.
export async function readJson(risposta) {
    return risposta.json().catch(() => ({}));
}

// Chiama /api/auth/refresh con credentials: 'include' — il browser allega automaticamente il cookie con il refresh token.
// Il server verifica il refresh token, lo revoca, ne crea uno nuovo, e risponde con un nuovo access token.
// Se il refresh fallisce (token scaduto, revocato, utente cancellato) cancella il token locale e restituisce null.
// IMPORTANTE: usa fetch diretto e non apiFetch per evitare un loop infinito:
// apiFetch → 401 → refreshAccessToken → apiFetch → 401 → loop infinito.
export async function refreshAccessToken() {
    const risposta = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!risposta.ok) {
        clearAccessToken();
        return null;
    }

    const dati = await readJson(risposta);
    if (dati.accessToken) {
        saveAccessToken(dati.accessToken);
    }
    return dati.accessToken || null;
}

// Aggiunge gli header necessari a ogni richiesta:
// - Content-Type: application/json — solo se c'è un body, altrimenti express.json() non parserebbe req.body
// - Authorization: Bearer <token> — il JWT viene inviato nell'header con il prefisso Bearer.
//   Il middleware requireAuth lato backend legge questo header e verifica il token con jwt.verify.
function buildHeaders(options, token) {
    const headers = { ...(options.headers || {}) };

    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// La funzione più importante del layer API. Implementa il silent refresh in tre passi:
// 1. Prima fetch: fa la richiesta con il token corrente.
//    Se la risposta non è 401, la restituisce direttamente (qualsiasi risposta, 200 o 500, passa senza interferenze).
// 2. Se è 401: il token è scaduto. Chiama refreshAccessToken con il cookie.
//    Se il refresh fallisce (nuovoToken è null), restituisce la risposta 401 originale.
// 3. Seconda fetch: se il refresh è andato bene, ripete la richiesta con il nuovo token.
//    L'utente non si accorge di nulla — la sua azione va a buon fine come se il token non fosse mai scaduto.
export async function apiFetch(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;

    const risposta = await fetch(url, {
        ...options,
        headers: buildHeaders(options, getAccessToken()),
        credentials: 'include',
    });

    if (risposta.status !== 401) {
        return risposta;
    }

    const nuovoToken = await refreshAccessToken();

    if (!nuovoToken) {
        return risposta;
    }

    return fetch(url, {
        ...options,
        headers: buildHeaders(options, nuovoToken),
        credentials: 'include',
    });
}
