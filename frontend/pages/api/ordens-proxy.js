import { parseCookies, serializeCookie, setCookie } from './_cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

async function refreshAccessToken(refresh) {
  const upstream = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!upstream.ok) return null
  const data = await upstream.json()
  return data?.access || null
}

async function callUpstream(req, access, path) {
  const sanitizedPath = String(path || '').replace(/^\/+/, '')
  const url = new URL(`${API_BASE_URL}/api/ordens/${sanitizedPath}`)

  const headers = {}
  if (access) {
    headers.Authorization = `Bearer ${access}`
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(url.toString(), {
    method: req.method,
    headers,
    ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: JSON.stringify(req.body || {}) } : {}),
  })
}

export default async function handler(req, res) {
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const path = req.query.path
  if (!path) {
    return res.status(400).json({ detail: 'path is required' })
  }

  const cookies = parseCookies(req.headers.cookie)
  let access = cookies.wf_access
  const refresh = cookies.wf_refresh

  let upstream = await callUpstream(req, access, path)

  if (upstream.status === 401 && refresh) {
    const newAccess = await refreshAccessToken(refresh)
    if (newAccess) {
      const isProd = process.env.NODE_ENV === 'production'
      setCookie(
        res,
        serializeCookie('wf_access', newAccess, {
          httpOnly: true,
          sameSite: 'lax',
          secure: isProd,
          path: '/',
          maxAge: 60 * 15,
        })
      )
      access = newAccess
      upstream = await callUpstream(req, access, path)
    }
  }

  const text = await upstream.text()
  res.status(upstream.status)
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
  return res.send(text)
}
