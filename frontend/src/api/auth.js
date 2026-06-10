import {
  API_BASE_URL,
  apiFetch,
  clearAccessToken,
  getAccessTokenFromResponse,
  readJson,
  saveAccessToken,
} from './client';
//Funzione privata — nessun export. 
// Usa fetch diretto invece di apiFetch perché login e register sono rotte pubbliche —
//  non inviano JWT e non hanno bisogno del silent refresh. Aggiungere apiFetch qui sarebbe complessità inutile.
//JSON.stringify(body) serializza l'oggetto JavaScript in stringa JSON per il body HTTP. credentials: 
// 'include' è necessario anche qui — il server deve poter impostare il cookie con il refresh token nella risposta al login.
//Il throw new Error(dati.message) è il punto dove gli errori del server diventano errori JavaScript.
//  In Login.js il catch di handleLogin intercetta questo errore e lo mostra nell'Alert MUI.
async function postJson(path, body) {
  const risposta = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const dati = await readJson(risposta);

  if (!risposta.ok) {
    throw new Error(dati.message || 'Richiesta non riuscita');
  }

  return dati;
}

export async function loginUtente({ email, password }) {
  const dati = await postJson('/api/auth/login', { email, password });
  saveAccessToken(getAccessTokenFromResponse(dati));
  return dati;
}
//Destructuring dei parametri — riceve un oggetto e ne estrae email e password. 
// Dopo aver ricevuto la risposta, salva il JWT in localStorage con saveAccessToken. 
// il refresh token non viene toccato — arriva come Set-Cookie nella risposta HTTP e il browser lo gestisce autonomamente.
export async function registraUtente({ name, email, password, role, staffCode }) {
  return postJson('/api/auth/register', { name, email, password, role, staffCode });
}
//La più semplice. Non salva nessun token — 
// la registrazione non fa login automatico.
//  L'utente dopo la registrazione viene reindirizzato alla pagina di login.
export async function caricaUtenteCorrente() {
  const risposta = await apiFetch('/api/auth/me', { method: 'GET' });
  const dati = await readJson(risposta);

  if (!risposta.ok) {
    throw new Error(dati.message || 'Sessione non valida');
  }

  return dati.utente;
}
//Qui usa apiFetch — non fetch diretto.
//  Perché? Perché /api/auth/me è una rotta protetta che richiede il JWT. 
// Se il token è scaduto, apiFetch lo rinnova silenziosamente e riprova. 
// Viene chiamata al mount dell'app — tipicamente in Navbar — per sapere se l'utente è già loggato da una sessione precedente.
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
//Il punto interessante è il try/finally.
//  Il finally si esegue sempre — sia se la chiamata al server va bene sia se fallisce.
//  Questo è fondamentale: anche se il server è irraggiungibile o risponde 500, il token in localStorage viene comunque cancellato.
//  L'utente viene sloggato localmente in ogni caso.
//  Sarebbe un bug grave fare il contrario — se il server fosse temporaneamente down, l'utente rimarrebbe bloccato loggato per sempre.