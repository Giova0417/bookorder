export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function refreshAccessToken() {
  const risposta = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!risposta.ok) {
    localStorage.removeItem('token');
    return null;
  }

  const dati = await risposta.json();
  const nuovoToken = dati.token || dati.accessToken;

  if (nuovoToken) {
    localStorage.setItem('token', nuovoToken);
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
  const token = localStorage.getItem('token');
  const headers = buildHeaders(options, token);

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
