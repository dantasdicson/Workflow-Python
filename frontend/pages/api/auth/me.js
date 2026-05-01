import fs from 'node:fs/promises'
import formidable from 'formidable'

import { parseCookies, serializeCookie, setCookie } from '../_cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export const config = {
  api: {
    bodyParser: false,
  },
}

const parseMultipart = (req) => new Promise((resolve, reject) => {
  const form = formidable({ multiples: true, keepExtensions: true })
  form.parse(req, (err, fields, files) => {
    if (err) {
      reject(err)
      return
    }
    resolve({ fields, files })
  })
})

async function buildMultipartBody(req) {
  const { fields, files } = await parseMultipart(req)
  const body = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => {
      if (item !== undefined && item !== null) {
        body.append(key, String(item))
      }
    })
  })

  for (const [key, value] of Object.entries(files)) {
    const fileList = Array.isArray(value) ? value : [value]
    for (const file of fileList) {
      if (!file?.filepath) continue
      const buffer = await fs.readFile(file.filepath)
      const blob = new Blob([buffer], { type: file.mimetype || 'application/octet-stream' })
      body.append(key, blob, file.originalFilename || file.newFilename || 'arquivo')
    }
  }

  return body
}

async function refreshAccessToken(refresh, res) {
  if (!refresh) return null

  const upstream = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!upstream.ok) return null

  const data = await upstream.json()
  if (!data?.access) return null

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

  return data.access
}

async function requestMe(access, method, body) {
  return fetch(`${API_BASE_URL}/api/auth/me/`, {
    method,
    headers: {
      Authorization: `Bearer ${access}`,
    },
    ...(method === 'PUT' ? { body } : {}),
  })
}

export default async function handler(req, res) {
  if (!['GET', 'PUT'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const cookies = parseCookies(req.headers.cookie)
  let access = cookies.wf_access
  const refresh = cookies.wf_refresh

  if (!access) {
    access = await refreshAccessToken(refresh, res)
    if (!access) {
      return res.status(401).json({ detail: 'Not authenticated' })
    }
  }

  let body
  if (req.method === 'PUT') {
    body = await buildMultipartBody(req)
  }

  let upstream = await requestMe(access, req.method, body)

  if (upstream.status === 401 && req.method === 'GET') {
    access = await refreshAccessToken(refresh, res)
    if (access) {
      upstream = await requestMe(access, req.method)
    }
  }

  if (upstream.status === 401) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }

  const data = await upstream.json()
  return res.status(upstream.status).json(data)
}
