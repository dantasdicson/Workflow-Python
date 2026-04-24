import fs from 'fs/promises'
import formidable from 'formidable'

import { parseCookies, serializeCookie, setCookie } from '../_cookie'

export const config = {
  api: {
    bodyParser: false,
  },
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
const MAX_FILE_SIZE = 5 * 1024 * 1024

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: MAX_FILE_SIZE,
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }
      resolve({ fields, files })
    })
  })
}

async function toFormData(fields, files) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(fields || {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
    } else if (value != null) {
      formData.append(key, value)
    }
  }

  const portfolioFile = files?.portfolio_arquivo?.[0] || files?.portfolio_arquivo
  if (portfolioFile?.filepath) {
    const buffer = await fs.readFile(portfolioFile.filepath)
    const blob = new Blob([buffer], {
      type: portfolioFile.mimetype || 'application/octet-stream',
    })
    formData.append('portfolio_arquivo', blob, portfolioFile.originalFilename || 'portfolio')
  }

  const avatarFile = files?.foto_avatar?.[0] || files?.foto_avatar
  if (avatarFile?.filepath) {
    const buffer = await fs.readFile(avatarFile.filepath)
    const blob = new Blob([buffer], {
      type: avatarFile.mimetype || 'application/octet-stream',
    })
    formData.append('foto_avatar', blob, avatarFile.originalFilename || 'avatar')
  }

  return formData
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

async function callUpstream(method, access, body) {
  return fetch(`${API_BASE_URL}/api/anuncios-servico/meu-anuncio/`, {
    method,
    headers: access ? { Authorization: `Bearer ${access}` } : {},
    body,
  })
}

export default async function handler(req, res) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const cookies = parseCookies(req.headers.cookie)
  let access = cookies.wf_access
  const refresh = cookies.wf_refresh

  if (!access) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }

  let body
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { fields, files } = await parseForm(req)
      body = await toFormData(fields, files)
    } catch (error) {
      const message = error?.message?.includes('maxFileSize')
        ? 'O arquivo de portfolio deve ter no maximo 5 MB.'
        : 'Erro ao processar o upload do portfolio.'
      return res.status(400).json({ detail: message })
    }
  }

  let upstream = await callUpstream(req.method, access, body)

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
      upstream = await callUpstream(req.method, access, body)
    }
  }

  const text = await upstream.text()
  res.status(upstream.status)
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
  return res.send(text)
}
