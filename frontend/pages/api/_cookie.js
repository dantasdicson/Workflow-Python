export function serializeCookie(name, value, options = {}) {
  const opt = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    ...options,
  }

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (opt.maxAge != null) cookie += `; Max-Age=${opt.maxAge}`
  if (opt.expires) cookie += `; Expires=${opt.expires.toUTCString()}`
  if (opt.path) cookie += `; Path=${opt.path}`
  if (opt.domain) cookie += `; Domain=${opt.domain}`
  if (opt.sameSite) cookie += `; SameSite=${opt.sameSite}`
  if (opt.secure) cookie += `; Secure`
  if (opt.httpOnly) cookie += `; HttpOnly`

  return cookie
}

export function parseCookies(cookieHeader = '') {
  const out = {}
  if (!cookieHeader) return out

  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = decodeURIComponent(part.slice(0, idx).trim())
    const val = decodeURIComponent(part.slice(idx + 1).trim())
    out[key] = val
  }
  return out
}

export function setCookie(res, cookie) {
  const prev = res.getHeader('Set-Cookie')
  if (!prev) {
    res.setHeader('Set-Cookie', cookie)
    return
  }
  if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, cookie])
    return
  }
  res.setHeader('Set-Cookie', [prev, cookie])
}
