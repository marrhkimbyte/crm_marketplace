import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
})

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    'crm-marketplace-secret-v3-change-this',
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const identifier = String(body.email || body.username || '')
      .trim()
      .toLowerCase()

    const password = String(body.password || '')

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email dan password wajib diisi.',
        },
        { status: 400 },
      )
    }

    const [rows] = await pool.execute<any[]>(
  `
  SELECT
    u.id AS id,
    u.name AS name,
    u.email AS email,
    u.password AS password,
    u.role AS role,
    u.customer_id AS customer_id
  FROM users u
  LEFT JOIN customers c
    ON c.id = u.customer_id
  WHERE LOWER(u.email) = ?
     OR LOWER(c.username) = ?
  LIMIT 1
  `,
  [identifier, identifier],
)

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email atau password salah.',
        },
        { status: 401 },
      )
    }

    const user = rows[0]

    let passwordValid = false

    if (
      typeof user.password === 'string' &&
      user.password.startsWith('$2')
    ) {
      passwordValid = await bcrypt.compare(
        password,
        user.password,
      )
    } else {
      passwordValid =
        password === user.password

      if (passwordValid) {
        const hashedPassword =
          await bcrypt.hash(password, 12)

        await pool.execute(
          `
          UPDATE users
          SET password = ?
          WHERE id = ?
          `,
          [hashedPassword, user.id],
        )
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email atau password salah.',
        },
        { status: 401 },
      )
    }

    const role =
      String(user.role).toLowerCase() ===
      'admin'
        ? 'admin'
        : 'customer'

    const customerId =
      user.customer_id
        ? Number(user.customer_id)
        : null

    const token = await new SignJWT({
      userId: Number(user.id),
      role,
      customerId,
      name: user.name,
      email: user.email,
    })
      .setProtectedHeader({
        alg: 'HS256',
      })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // PENTING:
    // Admin  -> /
    // Customer -> /customer
    const redirect =
      role === 'admin'
        ? '/'
        : '/customer'

    const response =
      NextResponse.json({
        success: true,
        user: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          role,
          customer_id: customerId,
        },
        redirect,
      })

    response.cookies.set({
      name: 'crm_session',
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error(
      'LOGIN ERROR:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Gagal melakukan login.',
      },
      { status: 500 },
    )
  }
}