import { parseCookies, serializeCookie, setCookie } from '../_cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const cookies = parseCookies(req.headers.cookie)
  const refresh = cookies.wf_refresh

  if (!refresh) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }

  const upstream = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!upstream.ok) {
    return res.status(401).json({ detail: 'Refresh inválido' })
  }

  const data = await upstream.json()
  if (!data?.access) {
    return res.status(401).json({ detail: 'Refresh inválido' })
  }

  const isProd = process.env.NODE_ENV === 'production'
  setCookie(
    res,
    serializeCookie('wf_access', data.access, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 15,
    })
  )

  return res.status(200).json({ ok: true })
}
