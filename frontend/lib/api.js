async function refreshSession() {
  const res = await fetch('/api/auth/refresh', { method: 'POST' })
  return res.ok
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : path

  const res = await fetch(url, {
    ...options,
    credentials: 'same-origin',
  })

  if (res.status !== 401) return res

  const refreshed = await refreshSession()
  if (!refreshed) return res

  return fetch(url, {
    ...options,
    credentials: 'same-origin',
  })
}

export async function getMe() {
  const res = await apiFetch('/api/auth/me', { method: 'GET' })
  if (!res.ok) return null
  return res.json()
}
