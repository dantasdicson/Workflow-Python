export function getMediaProxyUrl(url) {
  if (!url) return null

  try {
    const parsedUrl = new URL(url, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
    if (parsedUrl.pathname.startsWith('/media/')) {
      return `/media-proxy/${parsedUrl.pathname.slice('/media/'.length)}${parsedUrl.search}`
    }
  } catch (e) {
    // Keep the original URL if it cannot be parsed.
  }

  return url
}
