import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import type {
  RowDataPacket,
  ResultSetHeader,
} from 'mysql2'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
})

function ok(data: unknown, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )
}

function fail(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  )
}

/* =====================================================
   IMAGE UPLOAD
   FILE DISIMPAN DI:
   public/uploads/products/

   MYSQL HANYA MENYIMPAN:
   /uploads/products/nama-file.jpg
===================================================== */

async function saveImage(file: File | null) {
  if (!file || file.size === 0) {
    return null
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran gambar maksimal 5 MB.')
  }

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Format gambar harus JPG, JPEG, PNG, atau WEBP.',
    )
  }

  const extension =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : 'jpg'

  const fileName = `product-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}.${extension}`

  const uploadDirectory = path.join(
    process.cwd(),
    'public',
    'uploads',
    'products',
  )

  await fs.mkdir(uploadDirectory, {
    recursive: true,
  })

  const buffer = Buffer.from(
    await file.arrayBuffer(),
  )

  await fs.writeFile(
    path.join(uploadDirectory, fileName),
    buffer,
  )

  return `/uploads/products/${fileName}`
}

/* =====================================================
   DELETE IMAGE FILE
===================================================== */

async function deleteImageFile(
  imagePath: string | null,
) {
  if (!imagePath) return

  if (!imagePath.startsWith('/uploads/products/')) {
    return
  }

  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      imagePath,
    )

    await fs.unlink(filePath)
  } catch {
    // file mungkin sudah tidak ada
  }
}

/* =====================================================
   GET
===================================================== */

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url)

    const idParam =
      searchParams.get('id')

    /* =================================================
       DETAIL
    ================================================= */

    if (idParam) {
      const id = Number(idParam)

      if (!Number.isInteger(id) || id <= 0) {
        return fail(
          'ID produk tidak valid.',
          400,
        )
      }

      const [productRows] =
        await pool.query<RowDataPacket[]>(
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
              SUM(
                CASE
                  WHEN s.status = 'Selesai'
                  THEN s.total_price
                  ELSE 0
                END
              ),
              0
            ) AS total_revenue,

            COUNT(
              CASE
                WHEN s.status != 'Dibatalkan'
                THEN s.id
              END
            ) AS total_orders

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

      if (productRows.length === 0) {
        return fail(
          'Produk tidak ditemukan.',
          404,
        )
      }

      const product =
        productRows[0]

      const [salesRows] =
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

      return ok({
        product: {
          id: Number(product.id),
          name: String(product.name || ''),
          category:
            product.category || null,
          price: Number(product.price || 0),
          stock: Number(product.stock || 0),
          description:
            product.description || null,
          image:
            product.image || null,
          created_at:
            product.created_at,

          total_sold: Number(
            product.total_sold || 0,
          ),

          total_revenue: Number(
            product.total_revenue || 0,
          ),

          total_orders: Number(
            product.total_orders || 0,
          ),
        },

        sales: salesRows.map(
          (sale) => ({
            id: Number(sale.id),
            customer_id:
              Number(sale.customer_id || 0),
            product_id:
              Number(sale.product_id || 0),
            quantity:
              Number(sale.quantity || 0),
            total_price:
              Number(
                sale.total_price || 0,
              ),
            status:
              sale.status,
            created_at:
              sale.created_at,

            customer_name:
              sale.customer_name ||
              'Customer',

            customer_email:
              sale.customer_email ||
              null,

            customer_phone:
              sale.customer_phone ||
              null,
          }),
        ),
      })
    }

    /* =================================================
       SEMUA PRODUK
    ================================================= */

    const [rows] =
      await pool.query<RowDataPacket[]>(
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
            SUM(
              CASE
                WHEN s.status = 'Selesai'
                THEN s.total_price
                ELSE 0
              END
            ),
            0
          ) AS total_revenue,

          COUNT(
            CASE
              WHEN s.status != 'Dibatalkan'
              THEN s.id
            END
          ) AS total_orders

        FROM products p

        LEFT JOIN sales s
          ON s.product_id = p.id

        GROUP BY
          p.id,
          p.name,
          p.category,
          p.price,
          p.stock,
          p.description,
          p.image,
          p.created_at

        ORDER BY
          p.created_at DESC,
          p.id DESC
        `,
      )

    /* =================================================
       PRODUCT STATS
    ================================================= */

    const [statsRows] =
      await pool.query<RowDataPacket[]>(
        `
        SELECT

          COUNT(*) AS total_products,

          COALESCE(
            SUM(
              CASE
                WHEN stock > 0
                THEN 1
                ELSE 0
              END
            ),
            0
          ) AS available_products,

          COALESCE(
            SUM(
              CASE
                WHEN stock = 0
                THEN 1
                ELSE 0
              END
            ),
            0
          ) AS out_of_stock,

          COALESCE(
            SUM(stock),
            0
          ) AS total_stock

        FROM products
        `,
      )

    /* =================================================
       SALES STATS
    ================================================= */

    const [salesStatsRows] =
      await pool.query<RowDataPacket[]>(
        `
        SELECT

          COALESCE(
            SUM(
              CASE
                WHEN status = 'Selesai'
                THEN quantity
                ELSE 0
              END
            ),
            0
          ) AS total_sold,

          COALESCE(
            SUM(
              CASE
                WHEN status = 'Selesai'
                THEN total_price
                ELSE 0
              END
            ),
            0
          ) AS total_revenue

        FROM sales
        `,
      )

    const stats =
      statsRows[0] || {}

    const salesStats =
      salesStatsRows[0] || {}

    return ok({
      products: rows.map(
        (product) => ({
          id: Number(product.id),
          name: String(
            product.name || '',
          ),

          category:
            product.category || null,

          price: Number(
            product.price || 0,
          ),

          stock: Number(
            product.stock || 0,
          ),

          description:
            product.description ||
            null,

          image:
            product.image || null,

          created_at:
            product.created_at,

          total_sold:
            Number(
              product.total_sold || 0,
            ),

          total_revenue:
            Number(
              product.total_revenue ||
                0,
            ),

          total_orders:
            Number(
              product.total_orders ||
                0,
            ),
        }),
      ),

      stats: {
        total_products:
          Number(
            stats.total_products || 0,
          ),

        available_products:
          Number(
            stats.available_products ||
              0,
          ),

        out_of_stock:
          Number(
            stats.out_of_stock || 0,
          ),

        total_stock:
          Number(
            stats.total_stock || 0,
          ),

        total_sold:
          Number(
            salesStats.total_sold || 0,
          ),

        total_revenue:
          Number(
            salesStats.total_revenue ||
              0,
          ),
      },
    })
  } catch (error) {
    console.error(
      'GET PRODUCTS ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil data produk.',
    )
  }
}

/* =====================================================
   POST
   MULTIPART FORM DATA
===================================================== */

export async function POST(
  request: NextRequest,
) {
  try {
    const formData =
      await request.formData()

    const name =
      String(
        formData.get('name') || '',
      ).trim()

    const category =
      String(
        formData.get('category') || '',
      ).trim()

    const price =
      Number(
        formData.get('price'),
      )

    const stock =
      Number(
        formData.get('stock'),
      )

    const description =
      String(
        formData.get('description') ||
          '',
      ).trim()

    const imageValue =
      formData.get('image')

    const imageFile =
      imageValue instanceof File
        ? imageValue
        : null

    if (!name) {
      return fail(
        'Nama produk wajib diisi.',
        400,
      )
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return fail(
        'Harga produk tidak valid.',
        400,
      )
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return fail(
        'Stok produk tidak valid.',
        400,
      )
    }

    const image =
      await saveImage(imageFile)

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
        INSERT INTO products
        (
          name,
          category,
          price,
          stock,
          description,
          image
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          name,
          category || null,
          price,
          stock,
          description || null,
          image,
        ],
      )

    return ok(
      {
        id: result.insertId,
        image,
      },
      201,
    )
  } catch (error) {
    console.error(
      'POST PRODUCTS ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menambahkan produk.',
    )
  }
}

/* =====================================================
   PUT
   MULTIPART FORM DATA
===================================================== */

export async function PUT(
  request: NextRequest,
) {
  try {
    const formData =
      await request.formData()

    const id =
      Number(
        formData.get('id'),
      )

    const name =
      String(
        formData.get('name') || '',
      ).trim()

    const category =
      String(
        formData.get('category') || '',
      ).trim()

    const price =
      Number(
        formData.get('price'),
      )

    const stock =
      Number(
        formData.get('stock'),
      )

    const description =
      String(
        formData.get('description') ||
          '',
      ).trim()

    const removeImage =
      String(
        formData.get(
          'removeImage',
        ) || '',
      ) === 'true'

    const imageValue =
      formData.get('image')

    const imageFile =
      imageValue instanceof File
        ? imageValue
        : null

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return fail(
        'ID produk tidak valid.',
        400,
      )
    }

    if (!name) {
      return fail(
        'Nama produk wajib diisi.',
        400,
      )
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return fail(
        'Harga produk tidak valid.',
        400,
      )
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return fail(
        'Stok produk tidak valid.',
        400,
      )
    }

    const [oldRows] =
      await pool.query<RowDataPacket[]>(
        `
        SELECT image
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [id],
      )

    if (oldRows.length === 0) {
      return fail(
        'Produk tidak ditemukan.',
        404,
      )
    }

    const oldImage =
      oldRows[0].image || null

    let newImage =
      oldImage

    if (imageFile) {
      newImage =
        await saveImage(
          imageFile,
        )

      await deleteImageFile(
        oldImage,
      )
    } else if (removeImage) {
      newImage = null

      await deleteImageFile(
        oldImage,
      )
    }

    await pool.execute(
      `
      UPDATE products
      SET
        name = ?,
        category = ?,
        price = ?,
        stock = ?,
        description = ?,
        image = ?
      WHERE id = ?
      `,
      [
        name,
        category || null,
        price,
        stock,
        description || null,
        newImage,
        id,
      ],
    )

    return ok({
      id,
      image: newImage,
    })
  } catch (error) {
    console.error(
      'PUT PRODUCTS ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal mengubah produk.',
    )
  }
}

/* =====================================================
   DELETE
===================================================== */

export async function DELETE(
  request: NextRequest,
) {
  try {
    const body =
      await request.json()

    const id =
      Number(body.id)

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return fail(
        'ID produk tidak valid.',
        400,
      )
    }

    const [salesRows] =
      await pool.query<RowDataPacket[]>(
        `
        SELECT id
        FROM sales
        WHERE product_id = ?
        LIMIT 1
        `,
        [id],
      )

    if (salesRows.length > 0) {
      return fail(
        'Produk tidak dapat dihapus karena sudah memiliki riwayat penjualan.',
        409,
      )
    }

    const [imageRows] =
      await pool.query<RowDataPacket[]>(
        `
        SELECT image
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [id],
      )

    if (imageRows.length === 0) {
      return fail(
        'Produk tidak ditemukan.',
        404,
      )
    }

    const image =
      imageRows[0].image || null

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
        DELETE FROM products
        WHERE id = ?
        `,
        [id],
      )

    if (
      result.affectedRows === 0
    ) {
      return fail(
        'Produk tidak ditemukan.',
        404,
      )
    }

    await deleteImageFile(image)

    return ok({
      id,
    })
  } catch (error) {
    console.error(
      'DELETE PRODUCTS ERROR:',
      error,
    )

    return fail(
      error instanceof Error
        ? error.message
        : 'Gagal menghapus produk.',
    )
  }
}