import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export async function POST(
  request: NextRequest,
) {
  try {
    const formData = await request.formData()

    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: 'File gambar tidak ditemukan.',
        },
        { status: 400 },
      )
    }

    /* =========================
       VALIDASI TIPE FILE
    ========================= */

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Format gambar harus JPG, PNG, atau WEBP.',
        },
        { status: 400 },
      )
    }

    /* =========================
       VALIDASI UKURAN
    ========================= */

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Ukuran gambar maksimal 5 MB.',
        },
        { status: 400 },
      )
    }

    /* =========================
       BUAT FOLDER UPLOAD
    ========================= */

    const uploadDirectory = path.join(
      process.cwd(),
      'public',
      'uploads',
    )

    await mkdir(uploadDirectory, {
      recursive: true,
    })

    /* =========================
       NAMA FILE UNIK
    ========================= */

    const extension =
      EXTENSIONS[file.type]

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`

    const filePath = path.join(
      uploadDirectory,
      fileName,
    )

    /* =========================
       SIMPAN FILE
    ========================= */

    const bytes = await file.arrayBuffer()

    const buffer = Buffer.from(bytes)

    await writeFile(filePath, buffer)

    /* =========================
       URL YANG DISIMPAN DATABASE
    ========================= */

    const imageUrl =
      `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil diupload.',
      url: imageUrl,
      fileName,
    })
  } catch (error) {
    console.error(
      'UPLOAD IMAGE ERROR:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal mengupload foto.',
      },
      { status: 500 },
    )
  }
}