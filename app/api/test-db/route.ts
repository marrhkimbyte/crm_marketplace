import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT 1 AS connected'
    )

    return NextResponse.json({
      success: true,
      message: 'Database berhasil terhubung!',
      data: rows,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Database gagal terhubung.',
        error: String(error),
      },
      { status: 500 }
    )
  }
}