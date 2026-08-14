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
      ...((data as Record<string, unknown>) || {}),
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
   GET
   Mengambil:
   - follow ups
   - customers
   - leads
===================================================== */

export async function GET() {
  try {
    const [followUpRows] = await pool.query(`
      SELECT
        f.id,
        f.customer_id,
        f.lead_id,
        f.scheduled_date,
        f.scheduled_time,
        f.priority,
        f.status,
        f.note,
        f.created_at,

        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,

        l.status AS lead_status,
        l.source AS lead_source,

        p.name AS product_name,
        p.category AS product_category,
        p.price AS product_price,
        p.image AS product_image

      FROM follow_ups f

      INNER JOIN customers c
        ON c.id = f.customer_id

      LEFT JOIN leads l
        ON l.id = f.lead_id

      LEFT JOIN products p
        ON p.id = l.product_id

      ORDER BY
        CASE
          WHEN f.status = 'Terlambat' THEN 1
          WHEN f.status = 'Hari Ini' THEN 2
          WHEN f.status = 'Menunggu' THEN 3
          WHEN f.status = 'Selesai' THEN 4
          ELSE 5
        END,
        f.scheduled_date ASC,
        f.scheduled_time ASC,
        f.id DESC
    `)

    /* =====================================================
       CUSTOMER
    ===================================================== */

    const [customerRows] = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        address
      FROM customers
      ORDER BY name ASC
    `)

    /* =====================================================
       LEAD
    ===================================================== */

    const [leadRows] = await pool.query(`
      SELECT
        l.id,
        l.customer_id,
        l.product_id,
        l.status,
        l.source,

        c.name AS customer_name,

        p.name AS product_name,
        p.category AS product_category,
        p.price AS product_price

      FROM leads l

      INNER JOIN customers c
        ON c.id = l.customer_id

      INNER JOIN products p
        ON p.id = l.product_id

      ORDER BY l.created_at DESC, l.id DESC
    `)

    return ok({
      followUps: followUpRows,
      customers: customerRows,
      leads: leadRows,
    })
  } catch (error) {
    console.error('GET FOLLOW UPS ERROR:', error)

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil data follow-up.',
    )
  }
}

/* =====================================================
   POST
   Tambah Follow-Up
===================================================== */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const customerId = Number(body.customer_id)
    const leadId = body.lead_id
      ? Number(body.lead_id)
      : null

    const scheduledDate =
      body.scheduled_date

    const scheduledTime =
      body.scheduled_time || null

    const priority =
      body.priority || 'Sedang'

    const status =
      body.status || 'Menunggu'

    const note =
      typeof body.note === 'string'
        ? body.note.trim()
        : null

    /* =====================================================
       VALIDASI
    ===================================================== */

    if (!customerId) {
      return fail(
        'Customer wajib dipilih.',
        400,
      )
    }

    if (!scheduledDate) {
      return fail(
        'Tanggal follow-up wajib diisi.',
        400,
      )
    }

    const allowedPriority = [
      'Tinggi',
      'Sedang',
      'Rendah',
    ]

    if (!allowedPriority.includes(priority)) {
      return fail(
        'Prioritas tidak valid.',
        400,
      )
    }

    const allowedStatus = [
      'Menunggu',
      'Hari Ini',
      'Terlambat',
      'Selesai',
    ]

    if (!allowedStatus.includes(status)) {
      return fail(
        'Status follow-up tidak valid.',
        400,
      )
    }

    /* =====================================================
       CEK CUSTOMER
    ===================================================== */

    const [customerCheck] =
      await pool.execute(
        `
        SELECT id
        FROM customers
        WHERE id = ?
        LIMIT 1
        `,
        [customerId],
      )

    if (
      (customerCheck as unknown[]).length === 0
    ) {
      return fail(
        'Customer tidak ditemukan.',
        404,
      )
    }

    /* =====================================================
       CEK LEAD
    ===================================================== */

    if (leadId) {
      const [leadCheck] =
        await pool.execute(
          `
          SELECT id, customer_id
          FROM leads
          WHERE id = ?
          LIMIT 1
          `,
          [leadId],
        )

      const leads =
        leadCheck as Array<{
          id: number
          customer_id: number
        }>

      if (leads.length === 0) {
        return fail(
          'Lead tidak ditemukan.',
          404,
        )
      }

      if (
        Number(leads[0].customer_id) !==
        customerId
      ) {
        return fail(
          'Lead tersebut bukan milik customer yang dipilih.',
          400,
        )
      }
    }

    /* =====================================================
       INSERT
    ===================================================== */

    const [result] =
      await pool.execute(
        `
        INSERT INTO follow_ups
        (
          customer_id,
          lead_id,
          scheduled_date,
          scheduled_time,
          priority,
          status,
          note
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          customerId,
          leadId,
          scheduledDate,
          scheduledTime,
          priority,
          status,
          note,
        ],
      )

    const insertResult =
      result as mysql.ResultSetHeader

    return ok(
      {
        id: insertResult.insertId,
      },
      201,
    )
  } catch (error) {
    console.error(
      'POST FOLLOW UP ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menambahkan follow-up.',
    )
  }
}

/* =====================================================
   PUT
   Edit Follow-Up
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

    const leadId = body.lead_id
      ? Number(body.lead_id)
      : null

    const scheduledDate =
      body.scheduled_date

    const scheduledTime =
      body.scheduled_time || null

    const priority =
      body.priority || 'Sedang'

    const status =
      body.status || 'Menunggu'

    const note =
      typeof body.note === 'string'
        ? body.note.trim()
        : null

    if (!id) {
      return fail(
        'ID follow-up tidak valid.',
        400,
      )
    }

    if (!customerId) {
      return fail(
        'Customer wajib dipilih.',
        400,
      )
    }

    if (!scheduledDate) {
      return fail(
        'Tanggal follow-up wajib diisi.',
        400,
      )
    }

    const allowedPriority = [
      'Tinggi',
      'Sedang',
      'Rendah',
    ]

    if (!allowedPriority.includes(priority)) {
      return fail(
        'Prioritas tidak valid.',
        400,
      )
    }

    const allowedStatus = [
      'Menunggu',
      'Hari Ini',
      'Terlambat',
      'Selesai',
    ]

    if (!allowedStatus.includes(status)) {
      return fail(
        'Status follow-up tidak valid.',
        400,
      )
    }

    /* =====================================================
       CEK CUSTOMER
    ===================================================== */

    const [customerCheck] =
      await pool.execute(
        `
        SELECT id
        FROM customers
        WHERE id = ?
        LIMIT 1
        `,
        [customerId],
      )

    if (
      (customerCheck as unknown[]).length === 0
    ) {
      return fail(
        'Customer tidak ditemukan.',
        404,
      )
    }

    /* =====================================================
       CEK LEAD
    ===================================================== */

    if (leadId) {
      const [leadCheck] =
        await pool.execute(
          `
          SELECT id, customer_id
          FROM leads
          WHERE id = ?
          LIMIT 1
          `,
          [leadId],
        )

      const leads =
        leadCheck as Array<{
          id: number
          customer_id: number
        }>

      if (leads.length === 0) {
        return fail(
          'Lead tidak ditemukan.',
          404,
        )
      }

      if (
        Number(leads[0].customer_id) !==
        customerId
      ) {
        return fail(
          'Lead bukan milik customer tersebut.',
          400,
        )
      }
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    const [result] =
      await pool.execute(
        `
        UPDATE follow_ups
        SET
          customer_id = ?,
          lead_id = ?,
          scheduled_date = ?,
          scheduled_time = ?,
          priority = ?,
          status = ?,
          note = ?
        WHERE id = ?
        `,
        [
          customerId,
          leadId,
          scheduledDate,
          scheduledTime,
          priority,
          status,
          note,
          id,
        ],
      )

    const updateResult =
      result as mysql.ResultSetHeader

    if (updateResult.affectedRows === 0) {
      return fail(
        'Follow-up tidak ditemukan.',
        404,
      )
    }

    return ok({
      id,
    })
  } catch (error) {
    console.error(
      'PUT FOLLOW UP ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal memperbarui follow-up.',
    )
  }
}

/* =====================================================
   DELETE
   Hapus Follow-Up
===================================================== */

export async function DELETE(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    if (!id) {
      return fail(
        'ID follow-up tidak valid.',
        400,
      )
    }

    const [result] =
      await pool.execute(
        `
        DELETE FROM follow_ups
        WHERE id = ?
        `,
        [id],
      )

    const deleteResult =
      result as mysql.ResultSetHeader

    if (
      deleteResult.affectedRows === 0
    ) {
      return fail(
        'Follow-up tidak ditemukan.',
        404,
      )
    }

    return ok({
      id,
    })
  } catch (error) {
    console.error(
      'DELETE FOLLOW UP ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menghapus follow-up.',
    )
  }
}