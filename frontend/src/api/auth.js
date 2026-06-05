import {
  API_BASE_URL,
  apiFetch,
  clearAccessToken,
  getAccessTokenFromResponse,
  readJson,
  saveAccessToken,
} from './client';

async function postJson(path, body, options = {}) {
  const risposta = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
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

export async function registraUtente({ name, email, password, role, staffCode }) {
  return postJson('/api/auth/register', { name, email, password, role, staffCode });
}

export async function caricaUtenteCorrente() {
  const risposta = await apiFetch('/api/auth/me', { method: 'GET' });
  const dati = await readJson(risposta);

  if (!risposta.ok) {
    throw new Error(dati.message || 'Sessione non valida');
  }

  return dati.utente;
}

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