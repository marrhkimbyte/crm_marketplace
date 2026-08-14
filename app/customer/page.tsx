'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  Heart,
  MessageCircle,
  Package,
  ArrowRight,
  Menu,
  X,
  ShoppingCart,
  ClipboardList,
  Sparkles,
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

type UserData = {
  id: number
  name: string
  email: string
  role: string
  customer_id: number | null
}

type CartItem = Product & { quantity: number }

const money = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

export default function CustomerPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [interested, setInterested] = useState<number[]>([])
  const [notice, setNotice] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadMarketplace()

    try {
      const savedCart = localStorage.getItem('crm_cart')
      if (savedCart) setCart(JSON.parse(savedCart))

      const savedInterested = localStorage.getItem('crm_fav')
      if (savedInterested) setInterested(JSON.parse(savedInterested))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('crm_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('crm_fav', JSON.stringify(interested))
  }, [interested])

  async function loadMarketplace() {
    try {
      setLoading(true)

      const [userResponse, productResponse, notificationResponse, leadResponse] =
        await Promise.all([
          fetch('/api/auth/me', { cache: 'no-store' }),
          fetch('/api/products', { cache: 'no-store' }),
          fetch('/api/customer/notifications', { cache: 'no-store' }),
          fetch('/api/customer/leads', { cache: 'no-store' }),
        ])

      const userResult = await userResponse.json()
      const productResult = await productResponse.json()
      const notificationResult = await notificationResponse.json()
      const leadResult = await leadResponse.json()

      if (userResult.success) setUser(userResult.user)

      if (productResult.success) {
        setProducts(productResult.data?.products || [])
      }

      if (notificationResult.success) {
        setNotice(Number(notificationResult.data?.unread || 0))
      }

      if (leadResult.success) {
        const ids = (leadResult.data?.leads || []).map(
          (item: { product_id: number }) => Number(item.product_id),
        )
        setInterested(ids)
        localStorage.setItem('crm_fav', JSON.stringify(ids))
      }
    } catch (error) {
      console.error('CUSTOMER MARKETPLACE ERROR:', error)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.replace('/login')
    router.refresh()
  }

  const categories = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          products
            .map((product) => product.category)
            .filter(Boolean) as string[],
        ),
      ),
    ],
    [products],
  )

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const keyword = `${product.name} ${product.category || ''}`.toLowerCase()
        return (
          keyword.includes(search.toLowerCase()) &&
          (category === 'Semua' || product.category === category)
        )
      }),
    [products, search, category],
  )

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stock),
              }
            : item,
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })

    setMessage(`${product.name} ditambahkan ke keranjang.`)
    setTimeout(() => setMessage(''), 2200)
  }

  async function toggleInterest(productId: number) {
    if (interested.includes(productId)) {
      setMessage('Produk ini sudah ada di daftar minat.')
      setTimeout(() => setMessage(''), 2200)
      return
    }

    try {
      const response = await fetch('/api/customer/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menyimpan minat.')
      }

      setInterested((current) =>
        current.includes(productId) ? current : [...current, productId],
      )

      setMessage('❤️ Produk berhasil ditambahkan ke daftar minat.')
      setTimeout(() => setMessage(''), 2600)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Gagal menyimpan minat.',
      )
      setTimeout(() => setMessage(''), 2600)
    }
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={() => router.push('/customer')}
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShoppingBag className="size-5" />
            </div>
            <div className="hidden text-left sm:block">
              <b className="text-sm">CRM Marketplace</b>
              <p className="text-[10px] text-muted-foreground">
                Belanja lebih mudah
              </p>
            </div>
          </button>

          <div className="relative mx-auto flex max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari produk..."
              className="h-10 w-full rounded-xl border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => router.push('/customer/notifikasi')}
              className="relative flex size-10 items-center justify-center rounded-xl hover:bg-muted"
              aria-label="Notifikasi"
            >
              <Bell className="size-5" />
              {notice > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white">
                  {notice > 9 ? '9+' : notice}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/customer/chat')}
              className="hidden size-10 items-center justify-center rounded-xl hover:bg-muted md:flex"
              aria-label="Chat admin"
            >
              <MessageCircle className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/customer/keranjang')}
              className="relative flex size-10 items-center justify-center rounded-xl hover:bg-muted"
              aria-label="Keranjang"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl p-1.5 pr-3 hover:bg-muted"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
                <div className="text-left">
                  <b className="block max-w-28 truncate text-xs">
                    {user?.name || 'Customer'}
                  </b>
                  <span className="text-[9px] text-muted-foreground">
                    Customer
                  </span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border bg-card p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => router.push('/customer/profil')}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    Profil Saya
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/customer/pesanan')}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    Pesanan Saya
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/customer/minat')}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    Produk yang Saya Minati
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/customer/chat')}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    Chat Admin
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="size-10 rounded-xl hover:bg-muted md:hidden"
              onClick={() => setMobileMenu((value) => !value)}
              aria-label="Menu"
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t p-4 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => router.push('/customer/pesanan')}
                className="rounded-xl border p-3 text-left"
              >
                <ClipboardList className="size-4" />
                <p className="mt-2 text-xs font-semibold">Pesanan Saya</p>
              </button>

              <button
                type="button"
                onClick={() => router.push('/customer/profil')}
                className="rounded-xl border p-3 text-left"
              >
                <User className="size-4" />
                <p className="mt-2 text-xs font-semibold">Profil</p>
              </button>

              <button
                type="button"
                onClick={() => router.push('/customer/minat')}
                className="rounded-xl border p-3 text-left"
              >
                <Heart className="size-4 text-red-500" />
                <p className="mt-2 text-xs font-semibold">Produk Minat</p>
              </button>

              <button
                type="button"
                onClick={() => router.push('/customer/chat')}
                className="rounded-xl border p-3 text-left"
              >
                <MessageCircle className="size-4" />
                <p className="mt-2 text-xs font-semibold">Chat Admin</p>
              </button>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border p-3 text-left text-destructive"
              >
                <LogOut className="size-4" />
                <p className="mt-2 text-xs font-semibold">Logout</p>
              </button>
            </div>
          </div>
        )}
      </header>

      {message && (
        <div className="fixed right-4 top-20 z-50 flex max-w-sm items-center gap-2 rounded-xl border bg-card px-4 py-3 text-xs font-medium shadow-xl">
          <Check className="size-4 text-emerald-600" />
          {message}
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground md:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-xs opacity-80">
              <Sparkles className="size-4" />
              CRM MARKETPLACE
            </div>

            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Halo, {user?.name || 'Customer'} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 opacity-80">
              Temukan produk yang ditambahkan admin, simpan produk yang kamu
              minati, masukkan ke keranjang, lalu lakukan pemesanan.
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('products')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-xs font-semibold text-foreground"
            >
              Belanja Sekarang
              <ArrowRight className="size-4" />
            </button>
          </div>

          <ShoppingBag className="absolute bottom-5 right-8 hidden size-28 opacity-10 md:block" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold">Kategori</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pilih kategori untuk menemukan produk.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium ${
                category === item
                  ? 'bg-primary text-primary-foreground'
                  : 'border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section
        id="products"
        className="mx-auto max-w-7xl px-4 py-8 md:px-6"
      >
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold">Produk Pilihan</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filteredProducts.length} produk tersedia
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-card p-14 text-center">
            <Package className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">Produk tidak ditemukan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Coba ubah kata pencarian atau kategori.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const isInterested = interested.includes(product.id)

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Package className="size-16 text-muted-foreground/30" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleInterest(product.id)}
                      className={`absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border shadow-sm transition ${
                        isInterested
                          ? 'border-red-200 bg-red-50 text-red-500'
                          : 'bg-background/95 text-muted-foreground hover:text-red-500'
                      }`}
                      title={
                        isInterested
                          ? 'Sudah diminati'
                          : 'Minati produk'
                      }
                    >
                      <Heart
                        className={`size-4 ${
                          isInterested ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] text-primary">
                      {product.category || 'Produk'}
                    </p>

                    <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-base font-bold">
                      {money(product.price)}
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Stok: {product.stock}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!product.stock}
                        onClick={() => addToCart(product)}
                        className="rounded-xl border px-2 py-2.5 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
                      >
                        + Keranjang
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/customer/produk/${product.id}`)
                        }
                        className="rounded-xl bg-primary px-2 py-2.5 text-[11px] font-semibold text-primary-foreground"
                      >
                        Detail
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleInterest(product.id)}
                      className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold ${
                        isInterested
                          ? 'bg-red-50 text-red-600'
                          : 'border text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Heart
                        className={`size-3.5 ${
                          isInterested ? 'fill-current' : ''
                        }`}
                      />
                      {isInterested ? 'Sudah Diminati' : 'Minati Produk'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-7 text-center text-[10px] text-muted-foreground">
          © 2026 CRM Marketplace · Terintegrasi dengan CRM
        </div>
      </footer>
    </main>
  )
}
