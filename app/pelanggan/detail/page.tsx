'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  Phone,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { DashboardShell } from '@/components/crm/dashboard-shell'

type Customer = {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  status: string
}

type Stats = {
  total_chats: number
  total_leads: number
  total_transactions: number
  completed_transactions: number
  total_purchase: number
  completed_purchase: number
}

type Chat = {
  id: number
  customer_id: number
  sender: 'customer' | 'admin'
  message: string
  is_read: number | boolean
  created_at: string
}

type Lead = {
  id: number
  customer_id: number
  product_id: number
  status: string
  source: string | null
  created_at: string
  product_name: string | null
  product_category: string | null
  product_price: number | string | null
  product_stock: number | null
  product_description: string | null
  product_image: string | null
}

type Sale = {
  id: number
  customer_id: number
  product_id: number
  quantity: number
  total_price: number | string
  status:
    | 'Pending'
    | 'Diproses'
    | 'Selesai'
    | 'Dibatalkan'
  created_at: string
  product_name: string | null
  product_category: string | null
  product_price: number | string | null
  product_image: string | null
}

type ModalType =
  | 'edit'
  | 'delete'
  | null

export default function PelangganDetailPage() {
  const searchParams =
    useSearchParams()

  const customerId =
    searchParams.get('id')

  const [customer, setCustomer] =
    useState<Customer | null>(
      null,
    )

  const [stats, setStats] =
    useState<Stats>({
      total_chats: 0,
      total_leads: 0,
      total_transactions: 0,
      completed_transactions: 0,
      total_purchase: 0,
      completed_purchase: 0,
    })

  const [chats, setChats] =
    useState<Chat[]>([])

  const [leads, setLeads] =
    useState<Lead[]>([])

  const [sales, setSales] =
    useState<Sale[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [modal, setModal] =
    useState<ModalType>(null)

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [address, setAddress] =
    useState('')

  const [saving, setSaving] =
    useState(false)

  // =====================================================
  // LOAD DETAIL
  // =====================================================

  const loadDetail =
    useCallback(
      async () => {
        if (!customerId) {
          setError(
            'ID pelanggan tidak ditemukan.',
          )
          setLoading(false)
          return
        }

        try {
          setLoading(true)
          setError('')

          const response =
            await fetch(
              `/api/customers/detail?id=${customerId}`,
              {
                method: 'GET',
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
                'Gagal mengambil detail pelanggan.',
            )
          }

          const data =
            result.data

          setCustomer(
            data.customer ||
              null,
          )

          setStats({
            total_chats:
              Number(
                data.stats
                  ?.total_chats ||
                  0,
              ),

            total_leads:
              Number(
                data.stats
                  ?.total_leads ||
                  0,
              ),

            total_transactions:
              Number(
                data.stats
                  ?.total_transactions ||
                  0,
              ),

            completed_transactions:
              Number(
                data.stats
                  ?.completed_transactions ||
                  0,
              ),

            total_purchase:
              Number(
                data.stats
                  ?.total_purchase ||
                  0,
              ),

            completed_purchase:
              Number(
                data.stats
                  ?.completed_purchase ||
                  0,
              ),
          })

          setChats(
            data.chats || [],
          )

          setLeads(
            data.leads || [],
          )

          setSales(
            data.sales || [],
          )
        } catch (err) {
          console.error(
            'LOAD CUSTOMER DETAIL ERROR:',
            err,
          )

          setError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil detail pelanggan.',
          )
        } finally {
          setLoading(false)
        }
      },
      [customerId],
    )

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  // =====================================================
  // EDIT
  // =====================================================

  const openEdit = () => {
    if (!customer) return

    setName(
      customer.name || '',
    )

    setEmail(
      customer.email || '',
    )

    setPhone(
      customer.phone || '',
    )

    setAddress(
      customer.address || '',
    )

    setModal('edit')
  }

  const closeModal = () => {
    if (saving) return

    setModal(null)
  }

  const saveCustomer =
    async () => {
      if (!customer) return

      if (!name.trim()) {
        alert(
          'Nama pelanggan wajib diisi.',
        )
        return
      }

      try {
        setSaving(true)

        const response =
          await fetch(
            '/api/customers',
            {
              method: 'PUT',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                id: customer.id,
                name: name.trim(),
                email:
                  email.trim() ||
                  null,
                phone:
                  phone.trim() ||
                  null,
                address:
                  address.trim() ||
                  null,
              }),
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
              'Gagal memperbarui pelanggan.',
          )
        }

        alert(
          'Pelanggan berhasil diperbarui.',
        )

        setModal(null)

        await loadDetail()
      } catch (err) {
        console.error(
          'UPDATE CUSTOMER ERROR:',
          err,
        )

        alert(
          err instanceof Error
            ? err.message
            : 'Gagal memperbarui pelanggan.',
        )
      } finally {
        setSaving(false)
      }
    }

  // =====================================================
  // DELETE
  // =====================================================

  const deleteCustomer =
    async () => {
      if (!customer) return

      try {
        setSaving(true)

        const response =
          await fetch(
            '/api/customers',
            {
              method: 'DELETE',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                id: customer.id,
              }),
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
              'Gagal menghapus pelanggan.',
          )
        }

        alert(
          'Pelanggan berhasil dihapus.',
        )

        window.location.href =
          '/pelanggan'
      } catch (err) {
        console.error(
          'DELETE CUSTOMER ERROR:',
          err,
        )

        alert(
          err instanceof Error
            ? err.message
            : 'Gagal menghapus pelanggan.',
        )
      } finally {
        setSaving(false)
      }
    }

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (
    date?: string | null,
  ) => {
    if (!date) return '-'

    const value =
      new Date(date)

    if (
      Number.isNaN(
        value.getTime(),
      )
    ) {
      return '-'
    }

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(value)
  }

  const formatTime = (
    date?: string | null,
  ) => {
    if (!date) return ''

    const value =
      new Date(date)

    if (
      Number.isNaN(
        value.getTime(),
      )
    ) {
      return ''
    }

    return value.toLocaleTimeString(
      'id-ID',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    )
  }

  const formatRupiah = (
    value:
      | number
      | string
      | null
      | undefined,
  ) => {
    const number =
      Number(value || 0)

    return new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      },
    ).format(number)
  }

  const getInitials = (
    value: string,
  ) => {
    const parts =
      value
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (!parts.length) {
      return '?'
    }

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase()
    }

    return (
      parts[0][0] +
      parts[
        parts.length - 1
      ][0]
    ).toUpperCase()
  }

  const uniqueLeads =
    useMemo(() => {
      const map =
        new Map<
          number,
          Lead
        >()

      leads.forEach(
        (lead) => {
          if (
            !map.has(
              lead.product_id,
            )
          ) {
            map.set(
              lead.product_id,
              lead,
            )
          }
        },
      )

      return Array.from(
        map.values(),
      )
    }, [leads])

  // =====================================================
  // INVALID ID
  // =====================================================

  if (!customerId) {
    return (
      <DashboardShell activeItem="pelanggan">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <User className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-sm font-semibold">
              ID pelanggan tidak ditemukan
            </h2>

            <Link
              href="/pelanggan"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground"
            >
              <ArrowLeft className="size-4" />
              Kembali ke Pelanggan
            </Link>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardShell activeItem="pelanggan">
        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="mt-3 text-xs text-muted-foreground">
              Memuat detail pelanggan...
            </p>

          </div>

        </div>
      </DashboardShell>
    )
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !customer) {
    return (
      <DashboardShell activeItem="pelanggan">
        <div className="space-y-4">

          <Link
            href="/pelanggan"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Pelanggan
          </Link>

          <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">

            <User className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-sm font-semibold">
              Gagal memuat pelanggan
            </h2>

            <p className="mt-2 text-xs text-muted-foreground">
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadDetail
              }
              className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground"
            >
              Coba Lagi
            </button>

          </div>
        </div>
      </DashboardShell>
    )
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <DashboardShell activeItem="pelanggan">

      <div className="space-y-6">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">

          <Link
            href="/pelanggan"
            className="hover:text-foreground"
          >
            Pelanggan
          </Link>

          <span>/</span>

          <span>Detail Pelanggan</span>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <Link
              href="/pelanggan"
              className="flex size-10 items-center justify-center rounded-xl border transition hover:bg-muted"
              title="Kembali"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {getInitials(
                customer.name,
              )}
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-2xl font-semibold tracking-tight">
                  {customer.name}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    customer.status ===
                    'Aktif'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  ● {customer.status}
                </span>

              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Detail dan aktivitas pelanggan.
              </p>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-2">

            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-muted"
              >
                <Phone className="size-3.5" />
                Telepon
              </a>
            )}

            <Link
              href={`/chat?customer_id=${customer.id}`}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-muted"
            >
              <MessageSquare className="size-3.5" />
              Chat
            </Link>

            <button
              type="button"
              onClick={
                openEdit
              }
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-muted"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>

            <button
              type="button"
              onClick={() =>
                setModal(
                  'delete',
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Hapus
            </button>

          </div>

        </div>

        {/* =================================================
            IDENTITY
        ================================================= */}

        <section className="rounded-2xl border bg-card p-5 shadow-sm">

          <div className="mb-5">

            <h2 className="text-sm font-semibold">
              Data Identitas
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Informasi utama pelanggan.
            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <InfoItem
              icon={
                <User className="size-4" />
              }
              label="Nama"
              value={
                customer.name
              }
            />

            <InfoItem
              icon={
                <Mail className="size-4" />
              }
              label="Email"
              value={
                customer.email ||
                'Tidak ada email'
              }
            />

            <InfoItem
              icon={
                <Phone className="size-4" />
              }
              label="Nomor Telepon"
              value={
                customer.phone ||
                'Tidak ada nomor'
              }
            />

            <InfoItem
              icon={
                <MapPin className="size-4" />
              }
              label="Alamat"
              value={
                customer.address ||
                'Tidak ada alamat'
              }
            />

          </div>

          <div className="mt-5 border-t pt-4">

            <p className="text-[10px] text-muted-foreground">
              Bergabung
            </p>

            <p className="mt-1 text-xs font-medium">
              {formatDate(
                customer.created_at,
              )}
            </p>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <DetailStat
            label="Total Chat"
            value={
              stats.total_chats
            }
            icon={
              <MessageSquare className="size-4" />
            }
          />

          <DetailStat
            label="Barang Diminati"
            value={
              stats.total_leads
            }
            icon={
              <ShoppingBag className="size-4" />
            }
          />

          <DetailStat
            label="Total Transaksi"
            value={
              stats.total_transactions
            }
            icon={
              <Package className="size-4" />
            }
          />

          <DetailStat
            label="Transaksi Selesai"
            value={
              stats.completed_transactions
            }
            icon={
              <CheckCheck className="size-4" />
            }
          />

          <div className="rounded-2xl border bg-card p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-xs text-muted-foreground">
                Total Pembelian
              </p>

              <ShoppingBag className="size-4 text-muted-foreground" />

            </div>

            <p className="mt-2 text-lg font-semibold">
              {formatRupiah(
                stats.total_purchase,
              )}
            </p>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Tidak termasuk transaksi dibatalkan
            </p>

          </div>

        </div>

        {/* =================================================
            CHAT + INTEREST
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-2">

          {/* CHAT */}

          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

            <div className="flex items-center justify-between border-b p-5">

              <div>

                <h2 className="text-sm font-semibold">
                  Riwayat Chat
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Percakapan customer dengan admin.
                </p>

              </div>

              <MessageSquare className="size-4 text-muted-foreground" />

            </div>

            <div className="max-h-[480px] overflow-y-auto p-5">

              {chats.length ===
              0 ? (

                <EmptySection
                  icon={
                    <MessageSquare className="size-6" />
                  }
                  title="Belum ada chat"
                  description="Belum ada riwayat percakapan dengan pelanggan ini."
                />

              ) : (

                <div className="space-y-4">

                  {chats.map(
                    (chat) => {

                      const isAdmin =
                        chat.sender ===
                        'admin'

                      return (
                        <div
                          key={
                            chat.id
                          }
                          className={`flex ${
                            isAdmin
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >

                          <div
                            className={`max-w-[85%] ${
                              isAdmin
                                ? 'items-end'
                                : 'items-start'
                            }`}
                          >

                            <div
                              className={`rounded-2xl px-4 py-3 text-xs leading-5 ${
                                isAdmin
                                  ? 'rounded-br-md bg-primary text-primary-foreground'
                                  : 'rounded-bl-md border bg-background'
                              }`}
                            >
                              {chat.message}
                            </div>

                            <div
                              className={`mt-1 flex items-center gap-1.5 px-1 ${
                                isAdmin
                                  ? 'justify-end'
                                  : ''
                              }`}
                            >

                              <span className="text-[9px] text-muted-foreground">
                                {formatDate(
                                  chat.created_at,
                                )}{' '}
                                •{' '}
                                {formatTime(
                                  chat.created_at,
                                )}
                              </span>

                              {isAdmin &&
                                (chat.is_read ? (
                                  <CheckCheck className="size-3 text-primary" />
                                ) : (
                                  <Check className="size-3 text-muted-foreground" />
                                ))}

                            </div>

                          </div>

                        </div>
                      )
                    },
                  )}

                </div>
              )}

            </div>

          </section>

          {/* INTERESTED PRODUCTS */}

          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

            <div className="flex items-center justify-between border-b p-5">

              <div>

                <h2 className="text-sm font-semibold">
                  Barang yang Diminati
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Produk yang tercatat pada leads pelanggan.
                </p>

              </div>

              <ShoppingBag className="size-4 text-muted-foreground" />

            </div>

            <div className="max-h-[480px] overflow-y-auto p-5">

              {uniqueLeads.length ===
              0 ? (

                <EmptySection
                  icon={
                    <ShoppingBag className="size-6" />
                  }
                  title="Belum ada produk"
                  description="Belum ada produk yang diminati pelanggan."
                />

              ) : (

                <div className="space-y-3">

                  {uniqueLeads.map(
                    (lead) => (

                      <div
                        key={
                          lead.id
                        }
                        className="rounded-xl border p-4"
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Package className="size-5" />
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-start justify-between gap-2">

                              <div>

                                <h3 className="text-xs font-semibold">
                                  {lead.product_name ||
                                    'Produk tidak ditemukan'}
                                </h3>

                                {lead.product_category && (
                                  <p className="mt-1 text-[10px] text-muted-foreground">
                                    {
                                      lead.product_category
                                    }
                                  </p>
                                )}

                              </div>

                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-medium text-amber-600">
                                {lead.status}
                              </span>

                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">

                              <span>
                                {formatRupiah(
                                  lead.product_price,
                                )}
                              </span>

                              {lead.source && (
                                <span>
                                  Source:{' '}
                                  {
                                    lead.source
                                  }
                                </span>
                              )}

                              <span>
                                {formatDate(
                                  lead.created_at,
                                )}
                              </span>

                            </div>

                          </div>

                        </div>

                      </div>
                    ),
                  )}

                </div>
              )}

            </div>

          </section>

        </div>

        {/* =================================================
            SALES
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-sm font-semibold">
                Riwayat Pembelian
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Semua transaksi yang dilakukan pelanggan.
              </p>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-[10px] text-muted-foreground">
                Pembelian selesai
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatRupiah(
                  stats.completed_purchase,
                )}
              </p>

            </div>

          </div>

          {sales.length ===
          0 ? (

            <div className="p-12">

              <EmptySection
                icon={
                  <Package className="size-6" />
                }
                title="Belum ada transaksi"
                description="Pelanggan ini belum memiliki riwayat pembelian."
              />

            </div>

          ) : (

            <div className="divide-y">

              {sales.map(
                (sale) => (

                  <div
                    key={
                      sale.id
                    }
                    className="flex flex-col gap-4 p-5 transition hover:bg-muted/20 md:flex-row md:items-center"
                  >

                    {/* PRODUCT */}

                    <div className="flex min-w-0 flex-1 items-center gap-3">

                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package className="size-5" />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-semibold">
                          {sale.product_name ||
                            'Produk tidak ditemukan'}
                        </p>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Transaksi #
                          {sale.id}
                        </p>

                      </div>

                    </div>

                    {/* QUANTITY */}

                    <div className="min-w-[90px]">

                      <p className="text-[10px] text-muted-foreground">
                        Jumlah
                      </p>

                      <p className="mt-1 text-xs font-medium">
                        {sale.quantity} item
                      </p>

                    </div>

                    {/* PRICE */}

                    <div className="min-w-[140px]">

                      <p className="text-[10px] text-muted-foreground">
                        Total
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {formatRupiah(
                          sale.total_price,
                        )}
                      </p>

                    </div>

                    {/* STATUS */}

                    <div className="min-w-[110px]">

                      <SaleStatus
                        status={
                          sale.status
                        }
                      />

                    </div>

                    {/* DATE */}

                    <div className="min-w-[100px]">

                      <p className="text-[10px] text-muted-foreground">
                        Tanggal
                      </p>

                      <p className="mt-1 text-xs font-medium">
                        {formatDate(
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

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {modal ===
        'edit' && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Tutup"
            onClick={
              closeModal
            }
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h2 className="text-sm font-semibold">
                  Edit Pelanggan
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Perbarui data pelanggan.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
              >
                <X className="size-4" />
              </button>

            </div>

            <div className="space-y-4 p-5">

              <Field
                label="Nama"
                value={name}
                onChange={
                  setName
                }
              />

              <Field
                label="Email"
                value={email}
                onChange={
                  setEmail
                }
                type="email"
              />

              <Field
                label="Nomor Telepon"
                value={phone}
                onChange={
                  setPhone
                }
              />

              <div>

                <label className="text-xs font-medium">
                  Alamat
                </label>

                <textarea
                  value={
                    address
                  }
                  onChange={(
                    e,
                  ) =>
                    setAddress(
                      e.target
                        .value,
                    )
                  }
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />

              </div>

            </div>

            <div className="flex justify-end gap-2 border-t p-5">

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                className="rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  saveCustomer
                }
                disabled={
                  saving
                }
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
              >
                {saving
                  ? 'Menyimpan...'
                  : 'Simpan Perubahan'}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {modal ===
        'delete' && (

        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Tutup"
            onClick={
              closeModal
            }
            className="absolute inset-0 bg-black/30"
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-5 shadow-2xl">

            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Trash2 className="size-5" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
              Hapus Pelanggan?
            </h3>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">

              Data pelanggan{' '}

              <strong className="text-foreground">
                {customer.name}
              </strong>{' '}

              akan dihapus dari database.

            </p>

            {(stats.total_chats >
              0 ||
              stats.total_leads >
                0 ||
              stats.total_transactions >
                0) && (

              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-700">

                Pelanggan ini masih memiliki
                riwayat chat, lead, atau
                transaksi. Penghapusan dapat
                ditolak oleh database jika
                terdapat foreign key.

              </div>
            )}

            <div className="mt-5 flex gap-2">

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                className="flex-1 rounded-xl border py-2.5 text-xs font-medium hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  deleteCustomer
                }
                disabled={
                  saving
                }
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-medium text-white disabled:opacity-60"
              >
                {saving
                  ? 'Menghapus...'
                  : 'Hapus'}
              </button>

            </div>

          </div>
        </div>
      )}

    </DashboardShell>
  )
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">

      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[10px] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-medium">
          {value}
        </p>

      </div>

    </div>
  )
}

// =====================================================
// DETAIL STAT
// =====================================================

function DetailStat({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <div className="text-muted-foreground">
          {icon}
        </div>

      </div>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-muted-foreground">
        Data dari database
      </p>

    </div>
  )
}

// =====================================================
// EMPTY SECTION
// =====================================================

function EmptySection({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">

      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>

      <p className="mt-3 text-xs font-semibold">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-[10px] leading-5 text-muted-foreground">
        {description}
      </p>

    </div>
  )
}

// =====================================================
// SALE STATUS
// =====================================================

function SaleStatus({
  status,
}: {
  status: Sale['status']
}) {
  const config = {
    Pending: {
      className:
        'bg-amber-50 text-amber-600',
      icon: (
        <Clock className="size-3" />
      ),
    },

    Diproses: {
      className:
        'bg-blue-50 text-blue-600',
      icon: (
        <Package className="size-3" />
      ),
    },

    Selesai: {
      className:
        'bg-emerald-50 text-emerald-600',
      icon: (
        <Check className="size-3" />
      ),
    },

    Dibatalkan: {
      className:
        'bg-red-50 text-red-600',
      icon: (
        <X className="size-3" />
      ),
    },
  }

  const current =
    config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium ${current.className}`}
    >
      {current.icon}
      {status}
    </span>
  )
}

// =====================================================
// FIELD
// =====================================================

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (
    value: string,
  ) => void
  type?: string
}) {
  return (
    <div>

      <label className="text-xs font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary"
      />

    </div>
  )
}