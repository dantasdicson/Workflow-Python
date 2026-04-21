import { serializeCookie, setCookie } from '../_cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const { login, password } = req.body || {}
  if (!login || !password) {
    return res.status(400).json({ detail: 'Login e senha sao obrigatorios.' })
  }

  const upstream = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  })

  if (!upstream.ok) {
    let detail = 'Nao foi possivel realizar login.'
    try {
      const data = await upstream.json()
      if (data?.detail) detail = data.detail
    } catch (e) {
      try {
        const text = await upstream.text()
        if (text) detail = text
      } catch (e2) {
        // ignore
      }
    }
    return res.status(upstream.status).json({ detail })
  }

  const data = await upstream.json()
  const isProd = process.env.NODE_ENV === 'production'

  setCookie(
    res,
    serializeCookie('wf_access', data.access, {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 15,
    })
  )

  setCookie(
    res,
    serializeCookie('wf_refresh', data.refresh, {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  )

  return res.status(200).json({ ok: true, access: data.access, refresh: data.refresh })
}
