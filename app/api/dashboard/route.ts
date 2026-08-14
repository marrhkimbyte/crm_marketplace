import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export const runtime = 'nodejs'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(
    process.env.DB_PORT || 3306,
  ),
  user:
    process.env.DB_USER || 'root',
  password:
    process.env.DB_PASSWORD || '',
  database:
    process.env.DB_NAME ||
    'crm_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
})

export async function GET() {
  try {
    /* =====================================================
       KPI
    ===================================================== */

    const [
      customerRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT COUNT(*) AS total
        FROM customers
        `,
      )

    const [
      productRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT COUNT(*) AS total
        FROM products
        `,
      )

    const [leadRows] =
      await pool.query<any[]>(
        `
        SELECT COUNT(*) AS total
        FROM leads
        `,
      )

    const [chatRows] =
      await pool.query<any[]>(
        `
        SELECT COUNT(*) AS total
        FROM chats
        WHERE sender = 'customer'
          AND is_read = FALSE
        `,
      )

    const [salesRows] =
      await pool.query<any[]>(
        `
        SELECT
          COUNT(*) AS total_orders,
          COALESCE(
            SUM(total_price),
            0
          ) AS total_sales
        FROM sales
        WHERE status != 'Dibatalkan'
        `,
      )

    const [
      followUpRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT COUNT(*) AS total
        FROM follow_ups
        WHERE status != 'Selesai'
        `,
      )

    /* =====================================================
       LEAD STATS
    ===================================================== */

    const [
      leadStatsRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          COUNT(*) AS total,

          COALESCE(
            SUM(status = 'Tertarik'),
            0
          ) AS interested,

          COALESCE(
            SUM(status = 'Negosiasi'),
            0
          ) AS negotiation,

          COALESCE(
            SUM(status = 'Hot Lead'),
            0
          ) AS hot,

          COALESCE(
            SUM(status = 'Closing'),
            0
          ) AS closing,

          COALESCE(
            SUM(
              status =
                'Tidak Tertarik'
            ),
            0
          ) AS not_interested

        FROM leads
        `,
      )

    /* =====================================================
       SALES CHART
    ===================================================== */

    const [
      salesChartRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          DATE(created_at) AS date,
          COALESCE(
            SUM(total_price),
            0
          ) AS total_sales,
          COUNT(*) AS total_orders
        FROM sales
        WHERE status != 'Dibatalkan'
          AND created_at >= DATE_SUB(
            CURDATE(),
            INTERVAL 6 DAY
          )
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
        ASC
        `,
      )

    /* =====================================================
       POPULAR PRODUCTS
       Tetap tampil walaupun belum ada lead.
    ===================================================== */

    const [
      popularProductRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          p.id,
          p.name,
          p.category,
          p.price,
          p.stock,
          p.image,

          COUNT(l.id) AS interest_count

        FROM products p

        LEFT JOIN leads l
          ON l.product_id = p.id

        GROUP BY
          p.id,
          p.name,
          p.category,
          p.price,
          p.stock,
          p.image

        ORDER BY
          interest_count DESC,
          p.id DESC

        LIMIT 5
        `,
      )

    /* =====================================================
       RECENT LEADS
    ===================================================== */

    const [
      recentLeadRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          l.id,
          l.status,
          l.source,
          l.created_at,

          c.id AS customer_id,
          c.name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone,

          p.id AS product_id,
          p.name AS product_name,
          p.category AS product_category,
          p.price AS product_price,
          p.image AS product_image

        FROM leads l

        LEFT JOIN customers c
          ON c.id = l.customer_id

        LEFT JOIN products p
          ON p.id = l.product_id

        ORDER BY
          l.created_at DESC,
          l.id DESC

        LIMIT 5
        `,
      )

    /* =====================================================
       FOLLOW UP
    ===================================================== */

    const [
      recentFollowUpRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          f.id,
          f.customer_id,
          f.lead_id,
          f.scheduled_date,
          f.scheduled_time,
          f.priority,
          f.status,
          f.note,

          c.name AS customer_name

        FROM follow_ups f

        LEFT JOIN customers c
          ON c.id = f.customer_id

        WHERE f.status != 'Selesai'

        ORDER BY
          f.scheduled_date ASC,
          f.scheduled_time ASC,
          f.id DESC

        LIMIT 5
        `,
      )

    /* =====================================================
       RECENT CHAT
    ===================================================== */

    const [
      recentChatRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          ch.id,
          ch.customer_id,
          ch.sender,
          ch.message,
          ch.is_read,
          ch.created_at,

          c.name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone

        FROM chats ch

        LEFT JOIN customers c
          ON c.id = ch.customer_id

        ORDER BY
          ch.created_at DESC,
          ch.id DESC

        LIMIT 5
        `,
      )

    /* =====================================================
       ACTIVITY LEAD
    ===================================================== */

    const [
      activityLeadRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          'lead' AS type,
          l.id,
          l.created_at,
          c.name AS customer_name,
          p.name AS product_name,
          l.status

        FROM leads l

        LEFT JOIN customers c
          ON c.id = l.customer_id

        LEFT JOIN products p
          ON p.id = l.product_id

        ORDER BY
          l.created_at DESC,
          l.id DESC

        LIMIT 10
        `,
      )

    /* =====================================================
       ACTIVITY SALES
    ===================================================== */

    const [
      activitySalesRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          'sale' AS type,
          s.id,
          s.created_at,
          c.name AS customer_name,
          p.name AS product_name,
          s.status

        FROM sales s

        LEFT JOIN customers c
          ON c.id = s.customer_id

        LEFT JOIN products p
          ON p.id = s.product_id

        ORDER BY
          s.created_at DESC,
          s.id DESC

        LIMIT 10
        `,
      )

    /* =====================================================
       ACTIVITY CHAT
    ===================================================== */

    const [
      activityChatRows,
    ] =
      await pool.query<any[]>(
        `
        SELECT
          'chat' AS type,
          ch.id,
          ch.created_at,
          c.name AS customer_name,
          ch.message,
          ch.sender

        FROM chats ch

        LEFT JOIN customers c
          ON c.id = ch.customer_id

        ORDER BY
          ch.created_at DESC,
          ch.id DESC

        LIMIT 10
        `,
      )

    /* =====================================================
       ACTIVITY GABUNGAN
    ===================================================== */

    const activities = [
      ...activityLeadRows,
      ...activitySalesRows,
      ...activityChatRows,
    ]
      .sort(
        (a, b) =>
          new Date(
            b.created_at,
          ).getTime() -
          new Date(
            a.created_at,
          ).getTime(),
      )
      .slice(0, 10)

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      kpi: {
        customers: Number(
          customerRows[0]?.total ||
            0,
        ),

        products: Number(
          productRows[0]?.total ||
            0,
        ),

        leads: Number(
          leadRows[0]?.total || 0,
        ),

        unreadChats: Number(
          chatRows[0]?.total || 0,
        ),

        orders: Number(
          salesRows[0]
            ?.total_orders || 0,
        ),

        sales: Number(
          salesRows[0]
            ?.total_sales || 0,
        ),

        pendingFollowUps:
          Number(
            followUpRows[0]
              ?.total || 0,
          ),
      },

      leadStats:
        leadStatsRows[0] || {
          total: 0,
          interested: 0,
          negotiation: 0,
          hot: 0,
          closing: 0,
          not_interested: 0,
        },

      salesChart:
        salesChartRows,

      popularProducts:
        popularProductRows,

      recentLeads:
        recentLeadRows,

      recentFollowUps:
        recentFollowUpRows,

      recentChats:
        recentChatRows,

      activities,
    })
  } catch (error) {
    console.error(
      'DASHBOARD API ERROR:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Gagal mengambil data dashboard.',
      },
      {
        status: 500,
      },
    )
  }
}