//"Il layer API è diviso in due file: client.js è la fondazione che gestisce il token in localStorage, 
// costruisce gli header con il Bearer JWT, e implementa il silent refresh — 
// se una richiesta riceve 401 per token scaduto,
//  chiama automaticamente il refresh endpoint con il cookie HTTPOnly e ripete la richiesta originale trasparentemente. 
// api/auth.js costruisce sopra questa fondazione con funzioni specifiche per login, register, me e logout.
//  I componenti React non toccano mai fetch direttamente — questa separazione rispetta il principio di single responsibility del PP7."
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ACCESS_TOKEN_STORAGE_KEY = 'token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}
//Tre funzioni che incapsulano localStorage.
//  Come spiega il PP6, localStorage è una Browser Web API — non è JavaScript puro, 
// è un'interfaccia che il browser mette a disposizione per salvare dati persistenti in forma chiave-valore.
//Il if (token) in saveAccessToken è una guardia:
//  se il server risponde senza access token — per un bug o una risposta inattesa — non salviamo undefined in localStorage.
//Il motivo per cui il token sta in localStorage e non in un cookie:
//  l'access token dura 15 minuti, quindi anche se venisse rubato via XSS il danno è limitato. 
// Il refresh token invece — quello pericoloso perché dura 7 giorni — sta nel cookie HttpOnly e non è accessibile da JavaScript in nessun modo.
export function saveAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getAccessTokenFromResponse(dati) {
  return dati.accessToken;
}

export async function readJson(risposta) {
  return risposta.json().catch(() => ({}));
}
//risposta.json() parsa il body HTTP come JSON.
  //  Il .catch(() => ({})) è una protezione importante: se il server risponde con un body vuoto o non-JSON — 
  // per esempio un 500 generico senza corpo — risposta.json() lancerebbe un errore e romperebbe l'intera catena.
  //  Il catch restituisce un oggetto vuoto invece, permettendo al codice successivo di gestire l'errore con risposta.ok.
//Questo è legato a un comportamento di fetch spiegato nel PP6: 
// fetch non rigetta la Promise per errori HTTP — rigetta solo per errori di rete. 
// Quindi un 500 dal server non va nel catch di chi usa fetch — arriva nel then con risposta.ok = false.
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
  const nuovoToken = getAccessTokenFromResponse(dati);

  if (nuovoToken) {
    saveAccessToken(nuovoToken);
  }
  //Chiama /api/auth/refresh con credentials: 'include' — 
  // il browser allega automaticamente il cookie con il refresh token. 
  // Il server verifica il refresh token nel database, lo revoca, ne crea uno nuovo, e risponde con un nuovo access token.
//Se il refresh fallisce — refresh token scaduto, revocato, o utente cancellato
//  — cancella il token in localStorage e restituisce null. Chi ha chiamato questa funzione gestirà il null reindirizzando al login.
//Nota: usa fetch direttamente e non apiFetch. Se usasse apiFetch e il refresh fallisse,
//  si entrerebbe in un loop infinito: apiFetch riceve 401 → chiama refreshAccessToken → che chiama apiFetch → che riceve 401 → loop.
  return nuovoToken;
}
//Lo spread ...options.headers copia gli header che chi chiama ha già specificato. Poi aggiunge due header condizionali:
//Content-Type: application/json — solo se c'è un body e non è già stato specificato.
//  Senza questo header express.json() lato backend non parserebbe il body e req.body sarebbe undefined.
//Authorization: Bearer ${token} — il Bearer token pattern. 
// JWT viene inviato nell'header Authorization con il prefisso Bearer. Il PP8-9 spiega questo schema: 
// il middleware requireAuth lato backend legge esattamente questo header, estrae il token, e lo verifica con jwt.verify.
function buildHeaders(options, token) {
  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
//
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = buildHeaders(options, getAccessToken());

  const risposta = await fetch(url, {
    ...options,
    headers,
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
//Questa è la funzione più importante di tutto il layer.
//  Implementa il silent refresh — il rinnovo silenzioso del token senza che l'utente se ne accorga.
//Il flusso in ordine:
//Prima fetch: prende il token da localStorage, costruisce gli header, fa la richiesta. 
// Se la risposta non è 401, la restituisce direttamente — qualsiasi altra risposta, 200 o 500, passa senza interferenze.
//Se è 401: l'access token è scaduto. 
// Chiama refreshAccessToken che contatta /api/auth/refresh con il cookie. Se fallisce — nuovoToken è null — 
// restituisce la risposta 401 originale: sarà il componente React a gestirla, probabilmente reindirizzando al login.
//Seconda fetch: se il refresh è andato bene, ripete la richiesta originale con il nuovo token negli header. 
// L'utente non sa nulla — la sua azione (es. caricare gli ordini) va a buon fine come se non fosse successo nulla.
}
