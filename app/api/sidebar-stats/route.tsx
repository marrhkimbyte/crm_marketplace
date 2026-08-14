import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'

const pool = mysql.createPool({
  host:
    process.env.DB_HOST ||
    'localhost',

  port: Number(
    process.env.DB_PORT || 3306,
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

  waitForConnections: true,

  connectionLimit: 10,
})

type StatsRow = RowDataPacket & {
  leads: number
  unreadChats: number
}

export async function GET() {
  try {
    const [rows] =
      await pool.query<StatsRow[]>(`
        SELECT
          (
            SELECT COUNT(*)
            FROM leads
          ) AS leads,

          (
            SELECT COUNT(*)
            FROM chats
            WHERE sender = 'customer'
              AND is_read = 0
          ) AS unreadChats
      `)

    const stats = rows[0] || {
      leads: 0,
      unreadChats: 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        leads: Number(stats.leads || 0),
        unreadChats: Number(
          stats.unreadChats || 0,
        ),
      },
    })
  } catch (error) {
    console.error(
      'SIDEBAR STATS ERROR:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Gagal mengambil statistik.',
      },
      {
        status: 500,
      },
    )
  }
}