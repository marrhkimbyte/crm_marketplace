import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'crm-marketplace-secret-v3-change-this',
)

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('crm_session')?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: 'Belum login.',
        },
        { status: 401 },
      )
    }

    const { payload } =
      await jwtVerify(
        token,
        JWT_SECRET,
      )

    return NextResponse.json({
      success: true,
      authenticated: true,

      user: {
        id: Number(payload.userId),
        name: String(payload.name || ''),
        email: String(payload.email || ''),
        role: String(payload.role || ''),
        customer_id:
          payload.customerId
            ? Number(payload.customerId)
            : null,
      },
    })
  } catch (error) {
    console.error(
      'AUTH ME ERROR:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Session tidak valid.',
      },
      { status: 401 },
    )
  }
}