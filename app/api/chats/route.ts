import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import type {
  RowDataPacket,
  ResultSetHeader,
} from 'mysql2'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',

  port: Number(
    process.env.DB_PORT || 3306,
  ),

  user: process.env.DB_USER || 'root',

  password:
    process.env.DB_PASSWORD || '',

  database:
    process.env.DB_NAME ||
    'crm_marketplace',

  waitForConnections: true,

  connectionLimit: 10,
})

type CustomerRow = RowDataPacket & {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null

  last_message?: string | null
  last_sender?: 'customer' | 'admin' | null
  last_message_at?: string | null
  unread_count?: number
}

type ChatRow = RowDataPacket & {
  id: number
  customer_id: number
  sender: 'customer' | 'admin'
  message: string
  is_read: number
  created_at: string
}

type ChatStatsRow = RowDataPacket & {
  total_messages: number | string | null
  customer_messages: number | string | null
  admin_messages: number | string | null
  unread_messages: number | string | null
}

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
// GET
// =====================================================

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url)

    const customerIdParam =
      searchParams.get(
        'customer_id',
      )

    // =================================================
    // GET PESAN BERDASARKAN CUSTOMER
    // =================================================

    if (customerIdParam) {
      const customerId = Number(
        customerIdParam,
      )

      if (!customerId) {
        return fail(
          'Customer ID tidak valid.',
          400,
        )
      }

      const [messages] =
        await pool.query<ChatRow[]>(
          `
            SELECT
              id,
              customer_id,
              sender,
              message,
              is_read,
              created_at

            FROM chats

            WHERE customer_id = ?

            ORDER BY
              created_at ASC,
              id ASC
          `,
          [customerId],
        )

      // -----------------------------------------------
      // Tandai pesan customer sebagai sudah dibaca
      // -----------------------------------------------

      await pool.execute(
        `
          UPDATE chats

          SET is_read = 1

          WHERE
            customer_id = ?
            AND sender = 'customer'
            AND is_read = 0
        `,
        [customerId],
      )

      return ok({
        messages,
      })
    }

    // =================================================
    // GET SEMUA CUSTOMER
    // =================================================

    const [allCustomers] =
      await pool.query<CustomerRow[]>(
        `
          SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address,

            (
              SELECT ch.message
              FROM chats ch
              WHERE ch.customer_id = c.id
              ORDER BY
                ch.created_at DESC,
                ch.id DESC
              LIMIT 1
            ) AS last_message,

            (
              SELECT ch.sender
              FROM chats ch
              WHERE ch.customer_id = c.id
              ORDER BY
                ch.created_at DESC,
                ch.id DESC
              LIMIT 1
            ) AS last_sender,

            (
              SELECT ch.created_at
              FROM chats ch
              WHERE ch.customer_id = c.id
              ORDER BY
                ch.created_at DESC,
                ch.id DESC
              LIMIT 1
            ) AS last_message_at,

            (
              SELECT COUNT(*)
              FROM chats ch
              WHERE
                ch.customer_id = c.id
                AND ch.sender = 'customer'
                AND ch.is_read = 0
            ) AS unread_count

          FROM customers c

          ORDER BY
            c.name ASC
        `,
      )

    // =================================================
    // CUSTOMER YANG SUDAH MEMILIKI PERCAKAPAN
    // =================================================

    const customers =
      allCustomers
        .filter(
          (customer) =>
            customer.last_message !==
              null &&
            customer.last_message !==
              undefined,
        )
        .sort((a, b) => {
          const dateA = a.last_message_at
            ? new Date(
                a.last_message_at,
              ).getTime()
            : 0

          const dateB = b.last_message_at
            ? new Date(
                b.last_message_at,
              ).getTime()
            : 0

          return dateB - dateA
        })

    // =================================================
    // STATISTIK CHAT
    // =================================================

    const [statsRows] =
      await pool.query<
        ChatStatsRow[]
      >(
        `
          SELECT

            COUNT(*) AS total_messages,

            SUM(
              CASE
                WHEN sender = 'customer'
                THEN 1
                ELSE 0
              END
            ) AS customer_messages,

            SUM(
              CASE
                WHEN sender = 'admin'
                THEN 1
                ELSE 0
              END
            ) AS admin_messages,

            SUM(
              CASE
                WHEN
                  sender = 'customer'
                  AND is_read = 0
                THEN 1
                ELSE 0
              END
            ) AS unread_messages

          FROM chats
        `,
      )

    const stats =
      statsRows[0] || {
        total_messages: 0,
        customer_messages: 0,
        admin_messages: 0,
        unread_messages: 0,
      }

    return ok({
      customers,

      allCustomers,

      stats: {
        total_messages: Number(
          stats.total_messages || 0,
        ),

        customer_messages: Number(
          stats.customer_messages ||
            0,
        ),

        admin_messages: Number(
          stats.admin_messages || 0,
        ),

        unread_messages: Number(
          stats.unread_messages || 0,
        ),
      },
    })
  } catch (error) {
    console.error(
      'GET CHATS ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil data chat.',
    )
  }
}

// =====================================================
// POST - KIRIM PESAN
// =====================================================

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json()

    const customerId = Number(
      body.customer_id,
    )

    const sender =
      body.sender === 'customer'
        ? 'customer'
        : 'admin'

    const message = String(
      body.message || '',
    ).trim()

    // -----------------------------------------------
    // VALIDASI CUSTOMER
    // -----------------------------------------------

    if (!customerId) {
      return fail(
        'Customer wajib dipilih.',
        400,
      )
    }

    // -----------------------------------------------
    // VALIDASI PESAN
    // -----------------------------------------------

    if (!message) {
      return fail(
        'Pesan tidak boleh kosong.',
        400,
      )
    }

    // -----------------------------------------------
    // CEK CUSTOMER
    // -----------------------------------------------

    const [customerRows] =
      await pool.query<
        CustomerRow[]
      >(
        `
          SELECT
            id,
            name,
            email,
            phone,
            address

          FROM customers

          WHERE id = ?

          LIMIT 1
        `,
        [customerId],
      )

    if (
      customerRows.length === 0
    ) {
      return fail(
        'Customer tidak ditemukan.',
        404,
      )
    }

    // -----------------------------------------------
    // INSERT CHAT
    // -----------------------------------------------

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          INSERT INTO chats
          (
            customer_id,
            sender,
            message,
            is_read
          )

          VALUES
          (?, ?, ?, ?)
        `,
        [
          customerId,

          sender,

          message,

          sender === 'admin'
            ? 1
            : 0,
        ],
      )

    return ok(
      {
        id: result.insertId,
        customer_id: customerId,
        sender,
        message,
      },
      201,
    )
  } catch (error) {
    console.error(
      'POST CHAT ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengirim pesan.',
    )
  }
}

// =====================================================
// PUT - TANDAI PESAN SUDAH DIBACA
// =====================================================

export async function PUT(
  request: NextRequest,
) {
  try {
    const body =
      await request.json()

    const id = Number(
      body.id,
    )

    const customerId = Number(
      body.customer_id,
    )

    // =================================================
    // MARK BY CHAT ID
    // =================================================

    if (id) {
      const [result] =
        await pool.execute<ResultSetHeader>(
          `
            UPDATE chats

            SET is_read = 1

            WHERE id = ?
          `,
          [id],
        )

      if (
        result.affectedRows === 0
      ) {
        return fail(
          'Chat tidak ditemukan.',
          404,
        )
      }

      return ok({
        id,
      })
    }

    // =================================================
    // MARK ALL CUSTOMER MESSAGES AS READ
    // =================================================

    if (customerId) {
      await pool.execute(
        `
          UPDATE chats

          SET is_read = 1

          WHERE
            customer_id = ?
            AND sender = 'customer'
            AND is_read = 0
        `,
        [customerId],
      )

      return ok({
        customer_id: customerId,
      })
    }

    return fail(
      'ID chat atau customer tidak valid.',
      400,
    )
  } catch (error) {
    console.error(
      'PUT CHAT ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal memperbarui chat.',
    )
  }
}

// =====================================================
// DELETE - HAPUS PESAN
// =====================================================

export async function DELETE(
  request: NextRequest,
) {
  try {
    const body =
      await request.json()

    const id = Number(
      body.id,
    )

    if (!id) {
      return fail(
        'ID chat tidak valid.',
        400,
      )
    }

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          DELETE FROM chats

          WHERE id = ?
        `,
        [id],
      )

    if (
      result.affectedRows === 0
    ) {
      return fail(
        'Chat tidak ditemukan.',
        404,
      )
    }

    return ok({
      id,
    })
  } catch (error) {
    console.error(
      'DELETE CHAT ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menghapus chat.',
    )
  }
}