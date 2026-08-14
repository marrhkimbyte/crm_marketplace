'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Email wajib diisi.')
      return
    }

    if (!password) {
      setError('Password wajib diisi.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        '/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      )

      const result =
        await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Email atau password salah.',
        )
      }

      /*
       * SUPPORT 2 FORMAT RESPONSE:
       *
       * result.user
       * atau
       * result.data.user
       */

      const user =
        result.user ||
        result.data?.user

      if (!user) {
        throw new Error(
          'Data pengguna tidak ditemukan.',
        )
      }

      /*
       * ADMIN
       * masuk ke dashboard CRM
       */

      if (user.role === 'admin') {
        router.replace('/')
        router.refresh()
        return
      }

      /*
       * CUSTOMER
       * masuk ke marketplace customer
       */

      if (user.role === 'customer') {
        router.replace('/customer')
        router.refresh()
        return
      }

      throw new Error(
        'Role pengguna tidak dikenali.',
      )
    } catch (err) {
      console.error(
        'LOGIN ERROR:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal melakukan login.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="relative hidden overflow-hidden bg-primary lg:flex">

          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                <ShoppingBag className="size-6" />
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  CRM Marketplace
                </p>

                <p className="text-xs text-white/70">
                  Customer Relationship Management
                </p>
              </div>

            </div>

            {/* TEXT */}

            <div className="max-w-xl">

              <p className="text-sm font-medium text-white/70">
                MARKETPLACE CRM
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
                Kelola pelanggan.
                <br />
                Kelola produk.
                <br />
                Tingkatkan penjualan.
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-6 text-white/75">
                Satu platform untuk mengelola
                pelanggan, produk, lead,
                percakapan, follow-up, dan
                penjualan marketplace.
              </p>

            </div>

            {/* FOOTER */}

            <p className="text-xs text-white/50">
              © 2026 CRM Marketplace
            </p>

          </div>

        </div>

        {/* =====================================================
            RIGHT
        ===================================================== */}

        <div className="flex items-center justify-center px-5 py-10 md:px-8">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShoppingBag className="size-6" />
              </div>

              <div>
                <p className="text-lg font-bold">
                  CRM Marketplace
                </p>

                <p className="text-[10px] text-muted-foreground">
                  Customer Relationship Management
                </p>
              </div>

            </div>

            {/* HEADER */}

            <div className="mb-8">

              <p className="text-xs font-medium text-primary">
                SELAMAT DATANG
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Masuk ke akun Anda
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Masukkan email dan password
                untuk melanjutkan.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">

                <AlertCircle className="mt-0.5 size-4 shrink-0" />

                <div>
                  <p className="text-xs font-semibold">
                    Login gagal
                  </p>

                  <p className="mt-1 text-[11px] leading-5">
                    {error}
                  </p>
                </div>

              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium"
                >
                  Email
                </label>

                <div className="relative">

                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled={loading}
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-xs font-medium"
                  >
                    Password
                  </label>

                </div>

                <div className="relative">

                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    Masuk
                  </>
                )}

              </button>

            </form>

            {/* INFO */}

            <div className="mt-8 rounded-xl border bg-muted/30 p-4">

              <p className="text-xs font-semibold">
                Akses berdasarkan akun
              </p>

              <div className="mt-3 space-y-2">

                <div className="flex items-center justify-between">

                  <span className="text-[11px] text-muted-foreground">
                    Admin
                  </span>

                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                    Dashboard CRM
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-[11px] text-muted-foreground">
                    Customer
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
                    Marketplace
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}