'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Heart,
  Check,
} from 'lucide-react'

type Product = {
  id: number
  name: string
  category: string | null
  price: number
  stock: number
  description: string | null
  image: string | null
}

const money = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

export default function CustomerProductDetail() {
  const { id } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [interested, setInterested] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingInterest, setSavingInterest] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    try {
      setLoading(true)

      const [productResponse, leadResponse] = await Promise.all([
        fetch(`/api/products/${id}`, { cache: 'no-store' }),
        fetch('/api/customer/leads', { cache: 'no-store' }),
      ])

      const productResult = await productResponse.json()
      const leadResult = await leadResponse.json()

      setProduct(productResult.data?.product || null)

      if (leadResult.success) {
        const exists = (leadResult.data?.leads || []).some(
          (lead: { product_id: number }) =>
            Number(lead.product_id) === Number(id),
        )
        setInterested(exists)
      }
    } finally {
      setLoading(false)
    }
  }

  function addToCart() {
    if (!product) return

    try {
      const current = JSON.parse(
        localStorage.getItem('crm_cart') || '[]',
      ) as Array<Product & { quantity: number }>

      const existing = current.find(
        (item) => item.id === product.id,
      )

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + quantity,
          product.stock,
        )
      } else {
        current.push({
          ...product,
          quantity,
        })
      }

      localStorage.setItem(
        'crm_cart',
        JSON.stringify(current),
      )

      setMessage('Produk masuk ke keranjang.')
    } catch {
      setMessage('Gagal menambahkan ke keranjang.')
    }

    setTimeout(() => setMessage(''), 2500)
  }

  async function minati() {
    if (!product || interested || savingInterest) return

    try {
      setSavingInterest(true)

      const response = await fetch('/api/customer/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Gagal menyimpan minat.',
        )
      }

      setInterested(true)
      setMessage('❤️ Produk berhasil masuk daftar minat.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan minat.',
      )
    } finally {
      setSavingInterest(false)
      setTimeout(() => setMessage(''), 2500)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-10">
        Memuat produk...
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background p-10">
        <p className="font-semibold">Produk tidak ditemukan.</p>
        <button
          type="button"
          onClick={() => router.push('/customer')}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs text-primary-foreground"
        >
          Kembali ke Marketplace
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </button>

        <section className="mt-5 grid overflow-hidden rounded-3xl border bg-card shadow-sm md:grid-cols-2">
          <div className="flex min-h-[360px] items-center justify-center bg-muted/20 p-6 md:min-h-[520px]">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="max-h-[500px] w-full object-contain"
              />
            ) : (
              <Package className="size-24 text-muted-foreground/30" />
            )}
          </div>

          <div className="p-6 md:p-10">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] text-primary">
              {product.category || 'Produk'}
            </span>

            <h1 className="mt-5 text-3xl font-bold">
              {product.name}
            </h1>

            <p className="mt-3 text-2xl font-bold text-primary">
              {money(product.price)}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Stok tersedia: {product.stock}
            </p>

            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {product.description || 'Belum ada deskripsi.'}
            </p>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(1, value - 1),
                  )
                }
                className="size-10 rounded-xl border"
              >
                <Minus className="mx-auto size-4" />
              </button>

              <b className="min-w-8 text-center">
                {quantity}
              </b>

              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(product.stock, value + 1),
                  )
                }
                className="size-10 rounded-xl border"
              >
                <Plus className="mx-auto size-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={!product.stock}
              onClick={addToCart}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <ShoppingCart className="size-4" />
              Tambah ke Keranjang
            </button>

            <button
              type="button"
              disabled={interested || savingInterest}
              onClick={minati}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                interested
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'hover:bg-muted'
              }`}
            >
              {interested ? (
                <Check className="size-4" />
              ) : (
                <Heart className="size-4" />
              )}
              {interested
                ? 'Sudah Diminati'
                : savingInterest
                  ? 'Menyimpan...'
                  : 'Minati Produk'}
            </button>

            {message && (
              <p className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                <Check className="size-3.5" />
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                router.push('/customer/keranjang')
              }
              className="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-semibold"
            >
              Lihat Keranjang
            </button>

            <button
              type="button"
              onClick={() =>
                router.push('/customer/chat')
              }
              className="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-semibold"
            >
              Tanya Admin tentang Produk
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
