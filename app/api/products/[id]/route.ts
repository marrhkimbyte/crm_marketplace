import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
})

const ok = (data: unknown, status = 200) => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )
}

const fail = (message: string, status = 500) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  )
}

/* =====================================================
   GET DETAIL PRODUK
===================================================== */

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string
    }>
  },
) {
  try {
    const { id: idParam } = await context.params

    const id = Number(idParam)

    if (!id || !Number.isInteger(id)) {
      return fail(
        'ID produk tidak valid.',
        400,
      )
    }

    /* =================================================
       AMBIL PRODUK
    ================================================= */

    const [productRows] = await pool.execute(
      `
        SELECT
          p.id,
          p.name,
          p.category,
          p.price,
          p.stock,
          p.description,
          p.image,
          p.created_at,

          COALESCE(
            SUM(
              CASE
                WHEN s.status = 'Selesai'
                THEN s.quantity
                ELSE 0
              END
            ),
            0
          ) AS total_sold,

          COALESCE(
            COUNT(
              CASE
                WHEN s.status = 'Selesai'
                THEN s.id
                ELSE NULL
              END
            ),
            0
          ) AS total_orders,

          COALESCE(
            SUM(
              CASE
                WHEN s.status = 'Selesai'
                THEN s.total_price
                ELSE 0
              END
            ),
            0
          ) AS total_revenue

        FROM products p

        LEFT JOIN sales s
          ON s.product_id = p.id

        WHERE p.id = ?

        GROUP BY
          p.id,
          p.name,
          p.category,
          p.price,
          p.stock,
          p.description,
          p.image,
          p.created_at
      `,
      [id],
    )

    const products =
      productRows as any[]

    if (products.length === 0) {
      return fail(
        'Produk tidak ditemukan.',
        404,
      )
    }

    const product = products[0]

    /* =================================================
       RIWAYAT PENJUALAN
    ================================================= */

    const [salesRows] = await pool.execute(
      `
        SELECT
          s.id,
          s.customer_id,
          s.product_id,
          s.quantity,
          s.total_price,
          s.status,
          s.created_at,

          c.name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone

        FROM sales s

        LEFT JOIN customers c
          ON c.id = s.customer_id

        WHERE s.product_id = ?

        ORDER BY
          s.created_at DESC,
          s.id DESC
      `,
      [id],
    )

    /* =================================================
       STATISTIK STATUS TRANSAKSI
    ================================================= */

    const [statusRows] = await pool.execute(
      `
        SELECT
          s.status,
          COUNT(*) AS total_orders,
          COALESCE(
            SUM(s.quantity),
            0
          ) AS total_quantity,
          COALESCE(
            SUM(s.total_price),
            0
          ) AS total_revenue

        FROM sales s

        WHERE s.product_id = ?

        GROUP BY s.status

        ORDER BY
          CASE s.status
            WHEN 'Pending' THEN 1
            WHEN 'Diproses' THEN 2
            WHEN 'Selesai' THEN 3
            WHEN 'Dibatalkan' THEN 4
            ELSE 5
          END
      `,
      [id],
    )

    return ok({
      product: {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        total_sold: Number(product.total_sold),
        total_orders: Number(product.total_orders),
        total_revenue: Number(
          product.total_revenue,
        ),
      },

      sales: (salesRows as any[]).map(
        (sale) => ({
          ...sale,
          quantity: Number(
            sale.quantity,
          ),
          total_price: Number(
            sale.total_price,
          ),
        }),
      ),

      status_summary: (
        statusRows as any[]
      ).map((item) => ({
        status: item.status,
        total_orders: Number(
          item.total_orders,
        ),
        total_quantity: Number(
          item.total_quantity,
        ),
        total_revenue: Number(
          item.total_revenue,
        ),
      })),
    })
  } catch (error) {
    console.error(
      'GET PRODUCT DETAIL ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil detail produk.',
    )
  }
}