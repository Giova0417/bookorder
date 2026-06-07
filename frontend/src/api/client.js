export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ACCESS_TOKEN_STORAGE_KEY = 'token';

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

export function getAccessTokenFromResponse(dati) {
  return dati.accessToken;
}

export async function readJson(risposta) {
  return risposta.json().catch(() => ({}));
}

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

  return nuovoToken;
}

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
}
