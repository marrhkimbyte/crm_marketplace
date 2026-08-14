import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    'crm-marketplace-secret-v3-change-this',
)

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  )
}

function isStaticFile(pathname: string) {
  return (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  )
}

export async function middleware(
  request: NextRequest,
) {
  const { pathname } = request.nextUrl

  if (isStaticFile(pathname)) {
    return NextResponse.next()
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get(
      'crm_session',
    )?.value

  // BELUM LOGIN
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 },
      )
    }

    return NextResponse.redirect(
      new URL('/login', request.url),
    )
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        JWT_SECRET,
      )

    const role =
      String(payload.role || '').toLowerCase()

    // ==================================
    // CUSTOMER
    // ==================================
    if (role === 'customer') {

      // Customer HANYA boleh ke marketplace
      // dan API yang dibutuhkan marketplace.
      const customerAllowed =
        pathname === '/customer' ||
        pathname.startsWith('/customer/') ||
        pathname.startsWith('/api/customer') ||
        pathname.startsWith('/api/products') ||
        pathname.startsWith('/api/chats') ||
        pathname.startsWith('/api/auth')

      if (!customerAllowed) {
        return NextResponse.redirect(
          new URL(
            '/customer',
            request.url,
          ),
        )
      }

      return NextResponse.next()
    }

    // ==================================
    // ADMIN
    // ==================================
    if (role === 'admin') {
      return NextResponse.next()
    }

    // Role tidak valid
    const response =
      NextResponse.redirect(
        new URL(
          '/login',
          request.url,
        ),
      )

    response.cookies.set({
      name: 'crm_session',
      value: '',
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error(
      'MIDDLEWARE ERROR:',
      error,
    )

    const response =
      pathname.startsWith('/api/')
        ? NextResponse.json(
            {
              success: false,
              message:
                'Session tidak valid.',
            },
            { status: 401 },
          )
        : NextResponse.redirect(
            new URL(
              '/login',
              request.url,
            ),
          )

    response.cookies.set({
      name: 'crm_session',
      value: '',
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}