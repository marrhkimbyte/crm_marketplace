import {
  NextRequest,
  NextResponse,
} from 'next/server'
import mysql from 'mysql2/promise'
import type {
  RowDataPacket,
} from 'mysql2'

const pool =
  mysql.createPool({
    host:
      process.env.DB_HOST ||
      'localhost',

    port: Number(
      process.env.DB_PORT ||
        3306,
    ),

    user:
      process.env.DB_USER ||
      'root',

    password:
      process.env.DB_PASSWORD ||
      '',

    database:
      process.env.DB_NAME ||
      'crm_marketplace',

    waitForConnections:
      true,

    connectionLimit: 10,
  })

const ok = (
  data: unknown,
  status = 200,
) => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
    },
  )
}

const fail = (
  message: string,
  status = 500,
) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  )
}

// =====================================================
// GET DETAIL CUSTOMER
// =====================================================

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(
        request.url,
      )

    const customerId =
      Number(
        searchParams.get(
          'id',
        ),
      )

    if (!customerId) {
      return fail(
        'ID pelanggan tidak valid.',
        400,
      )
    }

    // =================================================
    // CUSTOMER
    // =================================================

    const [
      customerRows,
    ] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address,
            c.created_at
          FROM customers c
          WHERE c.id = ?
          LIMIT 1
        `,
        [customerId],
      )

    if (
      customerRows.length === 0
    ) {
      return fail(
        'Pelanggan tidak ditemukan.',
        404,
      )
    }

    const customer =
      customerRows[0]

    // =================================================
    // CHAT HISTORY
    // =================================================

    const [
      chatRows,
    ] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            ch.id,
            ch.customer_id,
            ch.sender,
            ch.message,
            ch.is_read,
            ch.created_at
          FROM chats ch
          WHERE ch.customer_id = ?
          ORDER BY
            ch.created_at ASC,
            ch.id ASC
        `,
        [customerId],
      )

    // =================================================
    // INTERESTED PRODUCTS / LEADS
    // =================================================

    const [
      leadRows,
    ] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            l.id,
            l.customer_id,
            l.product_id,
            l.status,
            l.source,
            l.created_at,

            p.name AS product_name,
            p.category AS product_category,
            p.price AS product_price,
            p.stock AS product_stock,
            p.description AS product_description,
            p.image AS product_image

          FROM leads l

          LEFT JOIN products p
            ON p.id = l.product_id

          WHERE l.customer_id = ?

          ORDER BY
            l.created_at DESC,
            l.id DESC
        `,
        [customerId],
      )

    // =================================================
    // SALES HISTORY
    // =================================================

    const [
      saleRows,
    ] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            s.id,
            s.customer_id,
            s.product_id,
            s.quantity,
            s.total_price,
            s.status,
            s.created_at,

            p.name AS product_name,
            p.category AS product_category,
            p.price AS product_price,
            p.image AS product_image

          FROM sales s

          LEFT JOIN products p
            ON p.id = s.product_id

          WHERE s.customer_id = ?

          ORDER BY
            s.created_at DESC,
            s.id DESC
        `,
        [customerId],
      )

    // =================================================
    // STATISTICS
    // =================================================

    const [
      statsRows,
    ] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT

            (
              SELECT COUNT(*)
              FROM chats
              WHERE customer_id = ?
            ) AS total_chats,

            (
              SELECT COUNT(*)
              FROM leads
              WHERE customer_id = ?
            ) AS total_leads,

            (
              SELECT COUNT(*)
              FROM sales
              WHERE customer_id = ?
            ) AS total_transactions,

            (
              SELECT COUNT(*)
              FROM sales
              WHERE customer_id = ?
              AND status = 'Selesai'
            ) AS completed_transactions,

            (
              SELECT COALESCE(
                SUM(
                  CASE
                    WHEN status != 'Dibatalkan'
                    THEN total_price
                    ELSE 0
                  END
                ),
                0
              )
              FROM sales
              WHERE customer_id = ?
            ) AS total_purchase,

            (
              SELECT COALESCE(
                SUM(
                  CASE
                    WHEN status = 'Selesai'
                    THEN total_price
                    ELSE 0
                  END
                ),
                0
              )
              FROM sales
              WHERE customer_id = ?
            ) AS completed_purchase

        `,
        [
          customerId,
          customerId,
          customerId,
          customerId,
          customerId,
          customerId,
        ],
      )

    const stats =
      statsRows[0] || {}

    // =================================================
    // CUSTOMER STATUS
    // =================================================

    const totalChats =
      Number(
        stats.total_chats ||
          0,
      )

    const totalLeads =
      Number(
        stats.total_leads ||
          0,
      )

    const totalTransactions =
      Number(
        stats.total_transactions ||
          0,
      )

    let status =
      'Tidak Aktif'

    if (
      totalChats > 0 ||
      totalLeads > 0 ||
      totalTransactions > 0
    ) {
      status = 'Aktif'
    }

    return ok({
      customer: {
        id: Number(
          customer.id,
        ),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address:
          customer.address,
        created_at:
          customer.created_at,
        status,
      },

      stats: {
        total_chats:
          totalChats,

        total_leads:
          totalLeads,

        total_transactions:
          totalTransactions,

        completed_transactions:
          Number(
            stats.completed_transactions ||
              0,
          ),

        total_purchase:
          Number(
            stats.total_purchase ||
              0,
          ),

        completed_purchase:
          Number(
            stats.completed_purchase ||
              0,
          ),
      },

      chats: chatRows,

      leads: leadRows,

      sales: saleRows,
    })
  } catch (error) {
    console.error(
      'GET CUSTOMER DETAIL ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil detail pelanggan.',
    )
  }
}