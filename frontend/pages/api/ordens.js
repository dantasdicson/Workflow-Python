import { parseCookies, serializeCookie, setCookie } from './_cookie'
import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({})
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

async function callUpstream(req, access, payload) {
  const url = new URL(`${API_BASE_URL}/api/ordens/`)
  const qs = req.url?.split('?')[1]
  if (qs) url.search = qs

  const headers = { Authorization: `Bearer ${access}` }

  let body
  if (req.method === 'POST') {
    // Se for POST com FormData (upload), não define Content-Type
    if (!(payload instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(payload)
    }
  } else {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(url.toString(), {
    method: req.method,
    headers,
    body,
  })
}

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

async function getCurrentUser(access) {
  const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  })
  if (!res.ok) return null
  return res.json()
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const cookies = parseCookies(req.headers.cookie)
  const access = cookies.wf_access
  const refresh = cookies.wf_refresh

  if (!access) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }

  let payload
  if (req.method === 'POST') {
    try {
      // Temporariamente: tentar parse JSON primeiro
      if (req.headers['content-type']?.includes('application/json')) {
        const currentUser = await getCurrentUser(access)
        if (!currentUser) {
          return res.status(401).json({ detail: 'Not authenticated' })
        }
        payload = {
          ...req.body,
          contratante_id: currentUser.id_usuario
        }
        console.log('JSON payload:', payload)
      } else {
        // FormData (com upload)
        const { fields, files } = await parseForm(req)
        const currentUser = await getCurrentUser(access)
        if (!currentUser) {
          return res.status(401).json({ detail: 'Not authenticated' })
        }

        const formData = new FormData()

        // Adiciona campos (formidable retorna arrays)
        for (const key in fields) {
          const value = fields[key][0]
          formData.append(key, value)
        }

        // Adiciona contratante_id obrigatório
        formData.append('contratante_id', String(currentUser.id_usuario))

        // Debug: log do FormData  
        console.log('FormData entries:')
        for (let [key, value] of formData.entries()) {
          console.log(key, value)
        }

        // Adiciona arquivo, se existir
        if (files.imagem && files.imagem.length > 0) {
          formData.append('imagem', files.imagem[0])
        }

        payload = formData
      }
    } catch (err) {
      console.error('Erro ao processar requisição:', err)
      return res.status(400).json({ detail: 'Erro ao processar upload' })
    }
  }

  let upstream = await callUpstream(req, access, req.method === 'POST' ? payload : null)

  console.log('Upstream status:', upstream.status)
  if (!upstream.ok) {
    const errorText = await upstream.text()
    console.log('Upstream error:', errorText)
    return res.status(upstream.status).send(errorText)
  }

  if (upstream.status === 401) {
    if (!refresh) {
      return res.status(401).json({ detail: 'Not authenticated' })
    }

    const newAccess = await refreshAccessToken(refresh)
    if (!newAccess) {
      return res.status(401).json({ detail: 'Not authenticated' })
    }

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

    upstream = await callUpstream(req, newAccess, req.method === 'POST' ? payload : null)
  }

  const text = await upstream.text()
  res.status(upstream.status)
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
  return res.send(text)
}
