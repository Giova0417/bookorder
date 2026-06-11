import {
    API_BASE_URL,
    apiFetch,
    clearAccessToken,
    readJson,
    saveAccessToken,
} from './client';

// Funzione privata — nessun export.
// Usa fetch diretto invece di apiFetch perché login e register sono rotte pubbliche:
// non inviano JWT e non hanno bisogno del silent refresh.
// credentials: 'include' è necessario: il server deve poter impostare il cookie con il refresh token nella risposta.
// throw new Error(dati.message) trasforma gli errori del server in errori JavaScript,
// che i componenti React intercettano nel catch e mostrano all'utente.
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

// Dopo aver ricevuto la risposta, salva il JWT in localStorage con saveAccessToken.
// Il refresh token non viene toccato — arriva come Set-Cookie nella risposta HTTP
// e il browser lo gestisce autonomamente.
export async function loginUtente({ email, password }) {
    const dati = await postJson('/api/auth/login', { email, password });
    saveAccessToken(dati.accessToken);
    return dati;
}

// La più semplice: non salva nessun token.
// La registrazione non fa login automatico — l'utente viene reindirizzato alla pagina di login.
export async function registraUtente({ name, email, password, role, staffCode }) {
    return postJson('/api/auth/register', { name, email, password, role, staffCode });
}

// Usa apiFetch (non fetch diretto) perché /api/auth/me è una rotta protetta che richiede il JWT.
// Se il token è scaduto, apiFetch lo rinnova silenziosamente e riprova.
// Viene chiamata al mount dell'app (in Navbar) per sapere se l'utente è già loggato da una sessione precedente.
export async function caricaUtenteCorrente() {
    const risposta = await apiFetch('/api/auth/me', { method: 'GET' });
    const dati = await readJson(risposta);

    if (!risposta.ok) {
        throw new Error(dati.message || 'Sessione non valida');
    }

    return dati.utente;
}

// Il finally si esegue sempre — sia se la chiamata al server va bene, sia se fallisce.
// Questo è fondamentale: anche se il server è irraggiungibile o risponde 500,
// il token in localStorage viene comunque cancellato e l'utente viene sloggato localmente.
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
