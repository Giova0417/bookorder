import {
    API_BASE_URL,
    apiFetch,
    clearAccessToken,
    readJson,
    saveAccessToken,
} from './client';

// Usata per login e registrazione: sono rotte pubbliche, quindi usiamo fetch diretto
// invece di apiFetch (che aggiunge il token e gestisce il refresh, qui non necessari).
async function postJson(path, body) {
    const risposta = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const dati = await readJson(risposta);

    if (!risposta.ok) {
        throw new Error(dati.message || 'Richiesta non riuscita');
    }

    return dati;
}

// Chiama il backend, salva l'access token in localStorage e restituisce i dati utente.
// Il refresh token viene salvato automaticamente dal browser nel cookie HttpOnly:
// il frontend non lo vede mai, è il browser a gestirlo.
export async function loginUtente(email, password) {
    const dati = await postJson('/api/auth/login', { email, password });
    saveAccessToken(dati.accessToken);
    return dati;
}

export async function registraUtente(name, email, password, role, staffCode) {
    return postJson('/api/auth/register', { name, email, password, role, staffCode });
}

// Rotta protetta: usa apiFetch che aggiunge l'header Authorization
// e sa rinnovare il token automaticamente se è scaduto.
// Usata dalla Navbar per sapere chi è l'utente loggato.
export async function caricaUtenteCorrente() {
    const risposta = await apiFetch('/api/auth/me', { method: 'GET' });
    const dati = await readJson(risposta);

    if (!risposta.ok) {
        throw new Error(dati.message || 'Sessione non valida');
    }

    return dati.utente;
}

// Invalida il refresh token sul server e cancella l'access token locale.
// Il try/catch garantisce che anche se il server non risponde,
// l'utente venga sloggato localmente (clearAccessToken viene chiamato nel finally).
export async function logoutUtente() {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } finally {
        clearAccessToken();
    }
}
