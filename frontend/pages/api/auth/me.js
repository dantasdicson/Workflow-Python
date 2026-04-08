import { parseCookies } from '../_cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const cookies = parseCookies(req.headers.cookie)
  const access = cookies.wf_access

  if (!access) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }

  const upstream = await fetch(`${API_BASE_URL}/api/auth/me/`, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  })

  if (upstream.status === 401) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }

  const data = await upstream.json()
  return res.status(upstream.status).json(data)
}
