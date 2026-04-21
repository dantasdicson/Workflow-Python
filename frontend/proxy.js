import { NextResponse } from 'next/server'

export function proxy(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    return new NextResponse('Not Found', { status: 404 })
  }

  if (pathname === '/index') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/index'],
}
