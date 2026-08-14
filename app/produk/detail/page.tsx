'use client'

import {
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Package,
  Phone,
  ShoppingCart,
  TrendingUp,
  User,
} from 'lucide-react'
import { DashboardShell } from '@/components/crm/dashboard-shell'

type Product = {
  id: number
  name: string
  category: string | null
  price: number
  stock: number
  description: string | null
  image: string | null
  created_at: string
  total_sold: number
  total_revenue: number
  total_orders: number
}

type Sale = {
  id: number
  customer_id: number
  product_id: number
  quantity: number
  total_price: number
  status: string
  created_at: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
}

export default function ProdukDetailPage() {
  const [product, setProduct] =
    useState<Product | null>(
      null,
    )

  const [sales, setSales] =
    useState<Sale[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const params =
          new URLSearchParams(
            window.location.search,
          )

        const id =
          Number(
            params.get('id'),
          )

        if (
          !Number.isInteger(id) ||
          id <= 0
        ) {
          throw new Error(
            'ID produk tidak ditemukan.',
          )
        }

        const response =
          await fetch(
            `/api/products?id=${id}`,
            {
              cache: 'no-store',
            },
          )

        const result =
          await response.json()

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Produk tidak ditemukan.',
          )
        }

        setProduct(
          result.data?.product ||
            null,
        )

        setSales(
          Array.isArray(
            result.data?.sales,
          )
            ? result.data.sales
            : [],
        )
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil produk.',
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const rupiah = (
    value: number,
  ) =>
    new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      },
    ).format(value)

  const date = (
    value: string,
  ) => {
    const d =
      new Date(value)

    if (
      Number.isNaN(
        d.getTime(),
      )
    ) {
      return '-'
    }

    return d.toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    )
  }

  const stockStatus = (
    stock: number,
  ) => {
    if (stock === 0) {
      return 'bg-red-50 text-red-600'
    }

    if (stock <= 5) {
      return 'bg-amber-50 text-amber-600'
    }

    return 'bg-emerald-50 text-emerald-600'
  }

  if (loading) {
    return (
      <DashboardShell activeItem="produk">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="mt-3 text-xs text-muted-foreground">
              Memuat detail produk...
            </p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error || !product) {
    return (
      <DashboardShell activeItem="produk">
        <div className="space-y-5">

          <Link
            href="/produk"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Produk
          </Link>

          <div className="rounded-2xl border bg-card p-10 text-center">

            <Package className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-sm font-semibold">
              Produk tidak ditemukan
            </h2>

            <p className="mt-2 text-xs text-muted-foreground">
              {error ||
                'Data produk tidak tersedia.'}
            </p>

          </div>

        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell activeItem="produk">

      <div className="space-y-6">

        <div>
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Produk
          </Link>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>CRM</span>
            <span>/</span>

            <Link
              href="/produk"
              className="hover:text-foreground"
            >
              Produk
            </Link>

            <span>/</span>

            <span>
              Detail Produk
            </span>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

          <div className="grid lg:grid-cols-[320px_1fr]">

            <div className="flex min-h-[320px] items-center justify-center border-b bg-muted/20 p-6 lg:border-b-0 lg:border-r">

              {product.image ? (
                <img
                  src={
                    product.image
                  }
                  alt={
                    product.name
                  }
                  className="max-h-72 w-full rounded-xl object-contain"
                />
              ) : (
                <div className="flex size-32 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="size-14" />
                </div>
              )}

            </div>

            <div className="p-6">

              <div className="flex flex-wrap gap-2">

                {product.category && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
                    {
                      product.category
                    }
                  </span>
                )}

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-medium ${stockStatus(
                    product.stock,
                  )}`}
                >
                  {product.stock ===
                  0
                    ? 'Habis'
                    : product.stock <=
                        5
                      ? 'Stok Menipis'
                      : 'Tersedia'}
                </span>

              </div>

              <h1 className="mt-4 text-2xl font-semibold">
                {product.name}
              </h1>

              <p className="mt-2 text-xl font-semibold text-primary">
                {rupiah(
                  product.price,
                )}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <Info
                  icon={
                    <Package className="size-4" />
                  }
                  label="Stok"
                  value={`${product.stock} unit`}
                />

                <Info
                  icon={
                    <ShoppingCart className="size-4" />
                  }
                  label="Terjual"
                  value={`${product.total_sold} unit`}
                />

                <Info
                  icon={
                    <TrendingUp className="size-4" />
                  }
                  label="Order"
                  value={`${product.total_orders} order`}
                />

                <Info
                  icon={
                    <Calendar className="size-4" />
                  }
                  label="Ditambahkan"
                  value={date(
                    product.created_at,
                  )}
                />

              </div>

            </div>

          </div>

        </section>

        <div className="grid gap-4 md:grid-cols-3">

          <Stat
            label="Total Terjual"
            value={`${product.total_sold} unit`}
          />

          <Stat
            label="Total Order"
            value={`${product.total_orders} order`}
          />

          <Stat
            label="Pendapatan"
            value={rupiah(
              product.total_revenue,
            )}
          />

        </div>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">

          <h2 className="text-sm font-semibold">
            Deskripsi Produk
          </h2>

          <p className="mt-3 whitespace-pre-line text-xs leading-6 text-muted-foreground">
            {product.description ||
              'Belum ada deskripsi produk.'}
          </p>

        </section>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

          <div className="border-b p-5">

            <h2 className="text-sm font-semibold">
              Riwayat Penjualan
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Transaksi produk.
            </p>

          </div>

          {sales.length === 0 ? (
            <div className="p-10 text-center">

              <ShoppingCart className="mx-auto size-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                Belum ada penjualan
              </p>

            </div>
          ) : (
            <div className="divide-y">

              {sales.map(
                (sale) => (
                  <div
                    key={
                      sale.id
                    }
                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"
                  >

                    <div className="flex flex-1 items-center gap-3">

                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="size-4" />
                      </div>

                      <div>

                        <p className="text-xs font-semibold">
                          {
                            sale.customer_name
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-muted-foreground">

                          {sale.customer_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="size-3" />
                              {
                                sale.customer_email
                              }
                            </span>
                          )}

                          {sale.customer_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" />
                              {
                                sale.customer_phone
                              }
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Jumlah
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {
                          sale.quantity
                        }{' '}
                        unit
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Total
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {rupiah(
                          sale.total_price,
                        )}
                      </p>
                    </div>

                    <div>

                      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium">
                        {
                          sale.status
                        }
                      </span>

                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {date(
                          sale.created_at,
                        )}
                      </p>

                    </div>

                  </div>
                ),
              )}

            </div>
          )}

        </section>

      </div>

    </DashboardShell>
  )
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">

      <div className="flex size-8 items-center justify-center rounded-lg bg-background text-muted-foreground">
        {icon}
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground">
          {label}
        </p>

        <p className="text-xs font-semibold">
          {value}
        </p>
      </div>

    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>

    </div>
  )
}