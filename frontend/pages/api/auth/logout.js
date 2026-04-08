import { serializeCookie, setCookie } from '../_cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const isProd = process.env.NODE_ENV === 'production'

  setCookie(
    res,
    serializeCookie('wf_access', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 0,
    })
  )

  setCookie(
    res,
    serializeCookie('wf_refresh', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 0,
    })
  )

  return res.status(200).json({ ok: true })
}
