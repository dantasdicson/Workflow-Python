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

async function callUpstream(access) {
  return fetch(`${API_BASE_URL}/api/anuncios-servico/`, {
    method: 'GET',
    headers: access ? { Authorization: `Bearer ${access}` } : {},
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const cookies = parseCookies(req.headers.cookie)
  let access = cookies.wf_access
  const refresh = cookies.wf_refresh

  let upstream = await callUpstream(access)

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
      upstream = await callUpstream(access)
    }
  }

  const text = await upstream.text()
  res.status(upstream.status)
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
  return res.send(text)
}
