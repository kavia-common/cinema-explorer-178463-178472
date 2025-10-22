/**
 * PUBLIC_INTERFACE
 * getBackendBaseURL
 * Resolve backend base URL using REACT_APP_BACKEND_URL or localhost:3001 as fallback.
 */
export function getBackendBaseURL() {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const origin = window.location.origin || 'http://localhost:3000';
    try {
      const u = new URL(origin);
      return `${u.protocol}//${u.hostname}:3001`;
    } catch {
      return 'http://localhost:3001';
    }
  }
  return 'http://localhost:3001';
}

async function jsonFetch(path, { method = 'GET', body, token } = {}) {
  const base = getBackendBaseURL();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = data?.error || data?.message || `Request failed with status ${res.status}`;
    return { data: null, error: { status: res.status, message: err, details: data } };
  }
  return { data, error: null };
}

// PUBLIC_INTERFACE
export async function fetchSavedMovies({ page = 1, limit = 20 } = {}, token) {
  const qp = new URLSearchParams({ page: String(page), limit: String(limit) });
  return jsonFetch(`/api/movies?${qp.toString()}`, { method: 'GET', token });
}

// PUBLIC_INTERFACE
export async function createAttendance(payload, token) {
  return jsonFetch('/api/register', { method: 'POST', body: payload, token });
}

// PUBLIC_INTERFACE
export async function createFavorite(payload, token) {
  return jsonFetch('/api/favorites', { method: 'POST', body: payload, token });
}

// PUBLIC_INTERFACE
export async function getFavorites(userId, token) {
  if (!userId) {
    return { data: { data: [] }, error: null };
  }
  return jsonFetch(`/api/favorites/${encodeURIComponent(userId)}`, { method: 'GET', token });
}

export default {
  getBackendBaseURL,
  fetchSavedMovies,
  createAttendance,
  createFavorite,
  getFavorites,
};
