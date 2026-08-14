import { NextResponse } from 'next/server'
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

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>
  },
) {
  try {
    const { id } = await context.params

    const customerId = Number(id)

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID pelanggan tidak valid.',
        },
        { status: 400 },
      )
    }

    const [customerRows] = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.created_at,

        (
          SELECT COUNT(*)
          FROM leads l
          WHERE l.customer_id = c.id
        ) AS lead_count,

        (
          SELECT COUNT(*)
          FROM chats ch
          WHERE ch.customer_id = c.id
        ) AS chat_count,

        (
          SELECT COUNT(*)
          FROM sales s
          WHERE s.customer_id = c.id
        ) AS sales_count

      FROM customers c

      WHERE c.id = ?

      LIMIT 1
      `,
      [customerId],
    )

    const customers = customerRows as any[]

    if (customers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pelanggan tidak ditemukan.',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...customers[0],
        id: Number(customers[0].id),
        lead_count: Number(customers[0].lead_count || 0),
        chat_count: Number(customers[0].chat_count || 0),
        sales_count: Number(customers[0].sales_count || 0),
      },
    })
  } catch (error) {
    console.error(
      'CUSTOMER DETAIL API ERROR:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Gagal mengambil data pelanggan.',
      },
      { status: 500 },
    )
  }
}