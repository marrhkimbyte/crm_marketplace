import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
})

type CustomerStatus = 'Aktif' | 'Nonaktif'

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
   VALIDASI USERNAME
===================================================== */

const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/

function validateUsername(username: string) {
  if (!username) {
    return 'Username wajib diisi.'
  }

  if (username.length < 3) {
    return 'Username minimal 3 karakter.'
  }

  if (username.length > 50) {
    return 'Username maksimal 50 karakter.'
  }

  if (!usernameRegex.test(username)) {
    return 'Username hanya boleh berisi huruf, angka, titik, underscore, dan tanda minus.'
  }

  return null
}

/* =====================================================
   VALIDASI EMAIL
===================================================== */

function validateEmail(email: string) {
  if (!email) return null

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return 'Format email tidak valid.'
  }

  return null
}

/* =====================================================
   VALIDASI STATUS
===================================================== */

function normalizeStatus(
  status: unknown,
): CustomerStatus {
  return status === 'Nonaktif'
    ? 'Nonaktif'
    : 'Aktif'
}

/* =====================================================
   GET
   AMBIL SEMUA CUSTOMER
===================================================== */

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.username,
        c.status,
        c.email,
        c.phone,
        c.address,
        c.created_at,

        (
          SELECT COUNT(*)
          FROM leads l
          WHERE l.customer_id = c.id
        ) AS total_leads,

        (
          SELECT COUNT(*)
          FROM chats ch
          WHERE ch.customer_id = c.id
        ) AS total_chats,

        (
          SELECT COUNT(*)
          FROM sales s
          WHERE s.customer_id = c.id
        ) AS total_sales,

        (
          SELECT COALESCE(SUM(s.total_price), 0)
          FROM sales s
          WHERE s.customer_id = c.id
            AND s.status != 'Dibatalkan'
        ) AS total_transaction

      FROM customers c
      ORDER BY c.created_at DESC, c.id DESC
    `)

    /*
     * Password sengaja TIDAK diambil.
     *
     * Frontend hanya membutuhkan data akun/profil.
     */

    return ok({
      customers: rows,
    })
  } catch (error) {
    console.error(
      'GET CUSTOMERS ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil data pelanggan.',
    )
  }
}

/* =====================================================
   POST
   TAMBAH CUSTOMER
===================================================== */

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const name = String(
      body.name || '',
    ).trim()

    const username = String(
      body.username || '',
    )
      .trim()
      .toLowerCase()

    const password = String(
      body.password || '',
    )

    const status = normalizeStatus(
      body.status,
    )

    const role =
      String(body.role || 'customer').toLowerCase() === 'admin'
        ? 'admin'
        : 'customer'

    const email = String(
      body.email || '',
    ).trim()

    const phone = String(
      body.phone || '',
    ).trim()

    const address = String(
      body.address || '',
    ).trim()

    /* =========================
       VALIDASI NAMA
    ========================= */

    if (!name) {
      return fail(
        'Nama pelanggan wajib diisi.',
        400,
      )
    }

    /* =========================
       VALIDASI USERNAME
    ========================= */

    const usernameError =
      validateUsername(username)

    if (usernameError) {
      return fail(
        usernameError,
        400,
      )
    }

    /* =========================
       VALIDASI PASSWORD
    ========================= */

    if (!password) {
      return fail(
        'Password wajib diisi.',
        400,
      )
    }

    if (password.length < 6) {
      return fail(
        'Password minimal 6 karakter.',
        400,
      )
    }

    /* =========================
       VALIDASI EMAIL
    ========================= */

    const emailError =
      validateEmail(email)

    if (emailError) {
      return fail(emailError, 400)
    }

    if (!email) {
      return fail('Email wajib diisi karena digunakan untuk login customer.', 400)
    }

    /* =========================
       CEK USERNAME
    ========================= */

    const [existingUsername] =
      await pool.execute(
        `
          SELECT id
          FROM customers
          WHERE username = ?
          LIMIT 1
        `,
        [username],
      )

    const usernameRows =
      existingUsername as Array<{
        id: number
      }>

    if (usernameRows.length > 0) {
      return fail(
        'Username sudah digunakan. Silakan pilih username lain.',
        409,
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    if (role === 'admin') {
      if (!email) return fail('Email wajib diisi untuk akun admin.', 400)
      const [existing] = await pool.execute<any[]>(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [email],
      )
      if (existing.length) return fail('Email sudah digunakan oleh akun lain.', 409)
      const [userResult] = await pool.execute<mysql.ResultSetHeader>(
        `INSERT INTO users (name, email, password, role, customer_id) VALUES (?, ?, ?, 'admin', NULL)`,
        [name, email, hashedPassword],
      )
      return ok({ id: userResult.insertId, name, email, role: 'admin' }, 201)
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.execute<mysql.ResultSetHeader>(
        `INSERT INTO customers (name, username, password, status, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, username, hashedPassword, status, email || null, phone || null, address || null],
      )
      const customerId = result.insertId
      const [existingEmail] = await connection.execute<any[]>(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [email],
      )
      if (existingEmail.length) {
        throw new Error('Email sudah digunakan oleh akun lain.')
      }
      await connection.execute(
        `INSERT INTO users (name, email, password, role, customer_id) VALUES (?, ?, ?, 'customer', ?)`,
        [name, email, hashedPassword, customerId],
      )
      await connection.commit()
      return ok({ id: customerId, name, username, status, email: email || null, phone: phone || null, address: address || null, role: 'customer' }, 201)
    } catch (txError) {
      await connection.rollback()
      throw txError
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error(
      'POST CUSTOMERS ERROR:',
      error,
    )

    /*
     * MySQL duplicate username
     * protection tambahan.
     */

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    ) {
      return fail(
        'Username sudah digunakan. Silakan pilih username lain.',
        409,
      )
    }

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menambahkan pelanggan.',
    )
  }
}

/* =====================================================
   PUT
   EDIT CUSTOMER
===================================================== */

export async function PUT(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    const name = String(
      body.name || '',
    ).trim()

    const username = String(
      body.username || '',
    )
      .trim()
      .toLowerCase()

    /*
     * Password boleh kosong ketika edit.
     *
     * Jika kosong:
     * password lama tetap digunakan.
     *
     * Jika diisi:
     * password akan di-hash dan diganti.
     */

    const password = String(
      body.password || '',
    )

    const status = normalizeStatus(
      body.status,
    )

    const role =
      String(body.role || 'customer').toLowerCase() === 'admin'
        ? 'admin'
        : 'customer'

    const email = String(
      body.email || '',
    ).trim()

    const phone = String(
      body.phone || '',
    ).trim()

    const address = String(
      body.address || '',
    ).trim()

    /* =========================
       VALIDASI ID
    ========================= */

    if (!id || !Number.isInteger(id)) {
      return fail(
        'ID pelanggan tidak valid.',
        400,
      )
    }

    /* =========================
       VALIDASI NAMA
    ========================= */

    if (!name) {
      return fail(
        'Nama pelanggan wajib diisi.',
        400,
      )
    }

    /* =========================
       VALIDASI USERNAME
    ========================= */

    const usernameError =
      validateUsername(username)

    if (usernameError) {
      return fail(
        usernameError,
        400,
      )
    }

    /* =========================
       VALIDASI EMAIL
    ========================= */

    const emailError =
      validateEmail(email)

    if (emailError) {
      return fail(
        emailError,
        400,
      )
    }

    /* =========================
       CEK CUSTOMER
    ========================= */

    const [customerRows] =
      await pool.execute(
        `
          SELECT id
          FROM customers
          WHERE id = ?
          LIMIT 1
        `,
        [id],
      )

    const customerList =
      customerRows as Array<{
        id: number
      }>

    if (customerList.length === 0) {
      return fail(
        'Pelanggan tidak ditemukan.',
        404,
      )
    }

    /* =========================
       CEK USERNAME MILIK CUSTOMER LAIN
    ========================= */

    const [usernameRowsRaw] =
      await pool.execute(
        `
          SELECT id
          FROM customers
          WHERE username = ?
            AND id != ?
          LIMIT 1
        `,
        [
          username,
          id,
        ],
      )

    const usernameRows =
      usernameRowsRaw as Array<{
        id: number
      }>

    if (usernameRows.length > 0) {
      return fail(
        'Username sudah digunakan oleh pelanggan lain.',
        409,
      )
    }

    /* =========================
       UPDATE TANPA PASSWORD
    ========================= */

    if (!password) {
      const [result] =
        await pool.execute(
          `
            UPDATE customers
            SET
              name = ?,
              username = ?,
              status = ?,
              email = ?,
              phone = ?,
              address = ?
            WHERE id = ?
          `,
          [
            name,
            username,
            status,
            email || null,
            phone || null,
            address || null,
            id,
          ],
        )

      const updateResult =
        result as mysql.ResultSetHeader

      if (updateResult.affectedRows === 0) {
        return fail('Tidak ada perubahan data pelanggan.', 400)
      }

      await pool.execute(
        `UPDATE users SET name = ?, email = ? WHERE customer_id = ? AND role = 'customer'`,
        [name, email || null, id],
      )

      return ok({
        id,
        name,
        username,
        status,
        email: email || null,
        phone: phone || null,
        address: address || null,
        password_changed: false,
      })
    }

    /* =========================
       VALIDASI PASSWORD BARU
    ========================= */

    if (password.length < 6) {
      return fail(
        'Password baru minimal 6 karakter.',
        400,
      )
    }

    /* =========================
       HASH PASSWORD BARU
    ========================= */

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      )

    /* =========================
       UPDATE DENGAN PASSWORD
    ========================= */

    const [result] =
      await pool.execute(
        `
          UPDATE customers
          SET
            name = ?,
            username = ?,
            password = ?,
            status = ?,
            email = ?,
            phone = ?,
            address = ?
          WHERE id = ?
        `,
        [
          name,
          username,
          hashedPassword,
          status,
          email || null,
          phone || null,
          address || null,
          id,
        ],
      )

    const updateResult =
      result as mysql.ResultSetHeader

    if (updateResult.affectedRows === 0) {
      return fail('Gagal memperbarui pelanggan.', 400)
    }

    await pool.execute(
      `UPDATE users SET name = ?, email = ?, password = ? WHERE customer_id = ? AND role = 'customer'`,
      [name, email || null, hashedPassword, id],
    )

    return ok({
      id,
      name,
      username,
      status,
      email: email || null,
      phone: phone || null,
      address: address || null,
      password_changed: true,
    })
  } catch (error) {
    console.error(
      'PUT CUSTOMERS ERROR:',
      error,
    )

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    ) {
      return fail(
        'Username sudah digunakan. Silakan pilih username lain.',
        409,
      )
    }

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengubah pelanggan.',
    )
  }
}

/* =====================================================
   DELETE
   HAPUS CUSTOMER
===================================================== */

export async function DELETE(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    /* =========================
       VALIDASI ID
    ========================= */

    if (!id || !Number.isInteger(id)) {
      return fail(
        'ID pelanggan tidak valid.',
        400,
      )
    }

    /* =========================
       CEK CUSTOMER
    ========================= */

    const [customerRows] =
      await pool.execute(
        `
          SELECT id, name
          FROM customers
          WHERE id = ?
          LIMIT 1
        `,
        [id],
      )

    const customers =
      customerRows as Array<{
        id: number
        name: string
      }>

    if (customers.length === 0) {
      return fail(
        'Pelanggan tidak ditemukan.',
        404,
      )
    }

    /* =========================
       HAPUS CUSTOMER
    ========================= */

    await pool.execute(
      `DELETE FROM users WHERE customer_id = ? AND role = 'customer'`,
      [id],
    )

    const [result] = await pool.execute(
      `DELETE FROM customers WHERE id = ?`,
      [id],
    )

    const deleteResult =
      result as mysql.ResultSetHeader

    if (
      deleteResult.affectedRows === 0
    ) {
      return fail(
        'Gagal menghapus pelanggan.',
        400,
      )
    }

    return ok({
      id,
      name: customers[0].name,
    })
  } catch (error) {
    console.error(
      'DELETE CUSTOMERS ERROR:',
      error,
    )

    /*
     * Jika customer masih digunakan
     * oleh tabel lain dan FK aktif,
     * MySQL bisa menolak penghapusan.
     */

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ER_ROW_IS_REFERENCED_2'
    ) {
      return fail(
        'Pelanggan tidak dapat dihapus karena masih memiliki data chat, lead, atau transaksi.',
        409,
      )
    }

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menghapus pelanggan.',
    )
  }
}