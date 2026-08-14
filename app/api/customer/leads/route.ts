import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import pool from '@/lib/db'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'crm-marketplace-secret-v3-change-this',
)

async function getCustomerId(request: NextRequest) {
  const token = request.cookies.get('crm_session')?.value
  if (!token) throw new Error('UNAUTH')

  const { payload } = await jwtVerify(token, SECRET)

  if (String(payload.role || '') !== 'customer' || !payload.customerId) {
    throw new Error('FORBIDDEN')
  }

  return Number(payload.customerId)
}

export async function GET(request: NextRequest) {
  try {
    const customerId = await getCustomerId(request)

    const [rows] = await pool.query<any[]>(
      `SELECT
        l.id,
        l.product_id,
        l.status,
        l.source,
        l.created_at,
        p.name AS product_name,
        p.category,
        p.price,
        p.stock,
        p.image
       FROM leads l
       INNER JOIN products p ON p.id = l.product_id
       WHERE l.customer_id = ?
       ORDER BY l.created_at DESC, l.id DESC`,
      [customerId],
    )

    return NextResponse.json({
      success: true,
      data: {
        leads: rows.map((row) => ({
          ...row,
          id: Number(row.id),
          product_id: Number(row.product_id),
          price: Number(row.price),
          stock: Number(row.stock),
        })),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json(
      { success: false, message: message === 'UNAUTH' ? 'Unauthorized.' : 'Akses ditolak.' },
      { status: 401 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerId = await getCustomerId(request)
    const body = await request.json()
    const productId = Number(body.product_id)

    if (!productId || !Number.isInteger(productId)) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak valid.' },
        { status: 400 },
      )
    }

    const [products] = await pool.query<any[]>(
      'SELECT id FROM products WHERE id = ? LIMIT 1',
      [productId],
    )

    if (!products.length) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan.' },
        { status: 404 },
      )
    }

    const [existing] = await pool.query<any[]>(
      `SELECT id, status
       FROM leads
       WHERE customer_id = ? AND product_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [customerId, productId],
    )

    if (existing.length) {
      return NextResponse.json({
        success: true,
        alreadyInterested: true,
        data: {
          id: Number(existing[0].id),
          status: existing[0].status,
        },
        message: 'Produk sudah masuk daftar minat.',
      })
    }

    const [result] = await pool.execute<any>(
      `INSERT INTO leads (customer_id, product_id, status, source)
       VALUES (?, ?, 'Tertarik', 'Marketplace Customer')`,
      [customerId, productId],
    )

    return NextResponse.json(
      {
        success: true,
        alreadyInterested: false,
        data: { id: Number(result.insertId), status: 'Tertarik' },
        message: 'Produk berhasil ditambahkan ke daftar minat.',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('CUSTOMER LEAD ERROR:', error)
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json(
      { success: false, message: message === 'UNAUTH' ? 'Unauthorized.' : 'Gagal menyimpan minat produk.' },
      { status: message === 'UNAUTH' ? 401 : 500 },
    )
  }
}
