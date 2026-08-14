'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Package, ShoppingCart } from 'lucide-react'

type Lead = {
  id: number
  product_id: number
  product_name: string
  category: string | null
  price: number
  stock: number
  image: string | null
  status: string
}

const money = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

export default function MinatPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/customer/leads', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setRows(result.data?.leads || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <button
          type="button"
          onClick={() => router.push('/customer')}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs"
        >
          <ArrowLeft className="size-4" />
          Marketplace
        </button>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Heart className="size-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Produk yang Saya Minati</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Produk yang kamu tandai sebagai minat akan masuk ke CRM admin.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border bg-card p-10 text-center text-xs text-muted-foreground">
            Memuat daftar minat...
          </div>
        ) : !rows.length ? (
          <div className="mt-6 rounded-2xl border bg-card p-14 text-center">
            <Heart className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-3 font-semibold">Belum ada produk yang diminati</p>
            <button
              type="button"
              onClick={() => router.push('/customer')}
              className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
            >
              Jelajahi Produk
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <article
                key={row.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <div className="aspect-[4/3] bg-muted">
                  {row.image ? (
                    <img
                      src={row.image}
                      alt={row.product_name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Package className="size-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-[10px] text-primary">
                    {row.category || 'Produk'}
                  </p>
                  <h2 className="mt-1 font-semibold">{row.product_name}</h2>
                  <p className="mt-2 font-bold">{money(row.price)}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Status minat: {row.status}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/customer/produk/${row.product_id}`)
                      }
                      className="rounded-xl border px-3 py-2.5 text-xs font-semibold"
                    >
                      Lihat Detail
                    </button>
                    <button
                      type="button"
                      disabled={!row.stock}
                      onClick={() => {
                        const current = JSON.parse(
                          localStorage.getItem('crm_cart') || '[]',
                        )
                        const existing = current.find(
                          (item: { id: number }) =>
                            item.id === row.product_id,
                        )

                        if (existing) {
                          existing.quantity = Math.min(
                            existing.quantity + 1,
                            row.stock,
                          )
                        } else {
                          current.push({
                            id: row.product_id,
                            name: row.product_name,
                            category: row.category,
                            price: row.price,
                            stock: row.stock,
                            image: row.image,
                            quantity: 1,
                          })
                        }

                        localStorage.setItem(
                          'crm_cart',
                          JSON.stringify(current),
                        )
                        router.push('/customer/keranjang')
                      }}
                      className="flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                    >
                      <ShoppingCart className="size-3.5" />
                      Keranjang
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
