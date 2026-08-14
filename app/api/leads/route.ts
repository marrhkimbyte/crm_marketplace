import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import type {
  RowDataPacket,
  ResultSetHeader,
} from 'mysql2'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
})

const ok = (data: unknown, status = 200) =>
  NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )

const fail = (
  message: string,
  status = 500,
) =>
  NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  )

/* =====================================================
   GET
   Ambil semua lead + customer + product + statistik
===================================================== */

export async function GET() {
  try {
    /* =========================
       LEADS
    ========================= */

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        l.id,
        l.customer_id,
        l.product_id,
        l.status,
        l.source,
        l.created_at,

        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,

        p.name AS product_name,
        p.category AS product_category,
        p.price AS product_price,
        p.image AS product_image

      FROM leads l

      INNER JOIN customers c
        ON c.id = l.customer_id

      INNER JOIN products p
        ON p.id = l.product_id

      ORDER BY
        l.created_at DESC,
        l.id DESC
    `)

    /* =========================
       CUSTOMERS
    ========================= */

    const [customers] =
      await pool.query<RowDataPacket[]>(`
        SELECT
          id,
          name,
          email,
          phone

        FROM customers

        ORDER BY name ASC
      `)

    /* =========================
       PRODUCTS
    ========================= */

    const [products] =
      await pool.query<RowDataPacket[]>(`
        SELECT
          id,
          name,
          category,
          price,
          stock,
          image

        FROM products

        ORDER BY name ASC
      `)

    /* =========================
       STATISTICS
    ========================= */

    const [statsRows] =
      await pool.query<RowDataPacket[]>(`
        SELECT

          COUNT(*) AS total,

          SUM(
            status = 'Hot Lead'
          ) AS hot,

          SUM(
            status = 'Negosiasi'
          ) AS negotiation,

          SUM(
            status = 'Closing'
          ) AS closing,

          SUM(
            status = 'Tertarik'
          ) AS interested,

          SUM(
            status = 'Tidak Tertarik'
          ) AS not_interested

        FROM leads
      `)

    /* =========================
       RETURN
    ========================= */

    return ok({
      leads: rows,
      customers,
      products,
      stats: statsRows[0] || {
        total: 0,
        hot: 0,
        negotiation: 0,
        closing: 0,
        interested: 0,
        not_interested: 0,
      },
    })
  } catch (error) {
    console.error(
      'GET LEADS ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil data lead.',
    )
  }
}

/* =====================================================
   POST
   Tambah Lead
===================================================== */

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const customerId = Number(
      body.customer_id,
    )

    const productId = Number(
      body.product_id,
    )

    const status =
      body.status || 'Tertarik'

    const source =
      typeof body.source === 'string'
        ? body.source.trim() || null
        : null

    /* =========================
       VALIDASI
    ========================= */

    if (!customerId || !productId) {
      return fail(
        'Customer dan produk wajib dipilih.',
        400,
      )
    }

    const allowed = [
      'Tertarik',
      'Negosiasi',
      'Hot Lead',
      'Closing',
      'Tidak Tertarik',
    ]

    if (!allowed.includes(status)) {
      return fail(
        'Status lead tidak valid.',
        400,
      )
    }

    /* =========================
       INSERT
    ========================= */

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          INSERT INTO leads
          (
            customer_id,
            product_id,
            status,
            source
          )

          VALUES (?, ?, ?, ?)
        `,
        [
          customerId,
          productId,
          status,
          source,
        ],
      )

    return ok(
      {
        id: result.insertId,
      },
      201,
    )
  } catch (error) {
    console.error(
      'POST LEAD ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menambahkan lead.',
    )
  }
}

/* =====================================================
   PUT
   Edit Lead
===================================================== */

export async function PUT(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    const customerId = Number(
      body.customer_id,
    )

    const productId = Number(
      body.product_id,
    )

    const status = body.status

    const source =
      typeof body.source === 'string'
        ? body.source.trim() || null
        : null

    /* =========================
       VALIDASI
    ========================= */

    if (
      !id ||
      !customerId ||
      !productId
    ) {
      return fail(
        'Data lead belum lengkap.',
        400,
      )
    }

    const allowed = [
      'Tertarik',
      'Negosiasi',
      'Hot Lead',
      'Closing',
      'Tidak Tertarik',
    ]

    if (!allowed.includes(status)) {
      return fail(
        'Status lead tidak valid.',
        400,
      )
    }

    /* =========================
       UPDATE
    ========================= */

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          UPDATE leads

          SET
            customer_id = ?,
            product_id = ?,
            status = ?,
            source = ?

          WHERE id = ?
        `,
        [
          customerId,
          productId,
          status,
          source,
          id,
        ],
      )

    if (result.affectedRows === 0) {
      return fail(
        'Lead tidak ditemukan.',
        404,
      )
    }

    return ok({
      id,
    })
  } catch (error) {
    console.error(
      'PUT LEAD ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal memperbarui lead.',
    )
  }
}

/* =====================================================
   DELETE
   Hapus Lead
===================================================== */

export async function DELETE(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    if (!id) {
      return fail(
        'ID lead tidak valid.',
        400,
      )
    }

    /* =========================
       DELETE
    ========================= */

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          DELETE FROM leads
          WHERE id = ?
        `,
        [id],
      )

    if (result.affectedRows === 0) {
      return fail(
        'Lead tidak ditemukan.',
        404,
      )
    }

    return ok({
      id,
    })
  } catch (error) {
    console.error(
      'DELETE LEAD ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menghapus lead.',
    )
  }
}