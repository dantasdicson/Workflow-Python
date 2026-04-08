const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const upstream = await fetch(`${API_BASE_URL}/api/habilidades/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  const text = await upstream.text()
  res.status(upstream.status)
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
  return res.send(text)
}
