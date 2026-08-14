'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShoppingBag,
  Target,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'

type Customer = {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
}

type Lead = {
  id: number
  customer_id: number
  product_id: number
  status: string
  source: string | null
  created_at: string
  customer_name?: string
  product_name?: string
  product_category?: string
  product_price?: number
  product_image?: string | null
}

type Chat = {
  id: number
  customer_id: number
  sender: 'customer' | 'admin'
  message: string
  is_read: boolean
  created_at: string
}

type ModalType = 'edit' | 'delete' | null

export function CustomerDetail() {
  const searchParams = useSearchParams()

  const customerId = searchParams.get('id')

  const [customer, setCustomer] =
    useState<Customer | null>(null)

  const [leads, setLeads] =
    useState<Lead[]>([])

  const [chats, setChats] =
    useState<Chat[]>([])

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

  const loadCustomer = async () => {
    if (!customerId) {
      setError('ID pelanggan tidak ditemukan.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      /*
       * Ambil seluruh customer dari API,
       * lalu cari berdasarkan ID.
       *
       * Dengan cara ini kita tidak membutuhkan
       * route /api/customers/[id].
       */
      const customerResponse = await fetch(
        '/api/customers',
        {
          cache: 'no-store',
        },
      )

      const customerResult =
        await customerResponse.json()

      if (
        !customerResponse.ok ||
        !customerResult.success
      ) {
        throw new Error(
          customerResult.message ||
            'Gagal mengambil data pelanggan.',
        )
      }

      const customers: Customer[] =
        Array.isArray(
          customerResult.customers,
        )
          ? customerResult.customers
          : Array.isArray(
                customerResult.data,
              )
            ? customerResult.data
            : []

      const found = customers.find(
        (item) =>
          Number(item.id) ===
          Number(customerId),
      )

      if (!found) {
        throw new Error(
          'Pelanggan tidak ditemukan di database.',
        )
      }

      setCustomer(found)

      setName(found.name || '')
      setEmail(found.email || '')
      setPhone(found.phone || '')
      setAddress(found.address || '')

      /*
       * Ambil lead customer.
       */
      try {
        const leadResponse =
          await fetch(
            '/api/leads',
            {
              cache: 'no-store',
            },
          )

        const leadResult =
          await leadResponse.json()

        if (
          leadResponse.ok &&
          leadResult.success
        ) {
          const allLeads: Lead[] =
            Array.isArray(
              leadResult.leads,
            )
              ? leadResult.leads
              : Array.isArray(
                    leadResult.data?.leads,
                  )
                ? leadResult.data.leads
                : []

          setLeads(
            allLeads.filter(
              (lead) =>
                Number(
                  lead.customer_id,
                ) ===
                Number(customerId),
            ),
          )
        }
      } catch (leadError) {
        console.error(
          'LOAD LEADS ERROR:',
          leadError,
        )
      }

      /*
       * Ambil chat customer.
       */
      try {
        const chatResponse =
          await fetch(
            `/api/chats?customer_id=${customerId}`,
            {
              cache: 'no-store',
            },
          )

        const chatResult =
          await chatResponse.json()

        if (
          chatResponse.ok &&
          chatResult.success
        ) {
          const allChats: Chat[] =
            Array.isArray(
              chatResult.chats,
            )
              ? chatResult.chats
              : Array.isArray(
                    chatResult.data,
                  )
                ? chatResult.data
                : []

          setChats(allChats)
        }
      } catch (chatError) {
        console.error(
          'LOAD CHATS ERROR:',
          chatError,
        )
      }
    } catch (err) {
      console.error(
        'LOAD CUSTOMER DETAIL ERROR:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data pelanggan.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomer()
  }, [customerId])

  const openEdit = () => {
    if (!customer) return

    setName(customer.name || '')
    setEmail(customer.email || '')
    setPhone(customer.phone || '')
    setAddress(customer.address || '')

    setModal('edit')
  }

  const closeModal = () => {
    setModal(null)
  }

  const updateCustomer = async () => {
    if (!customer) return

    if (!name.trim()) {
      alert('Nama pelanggan wajib diisi.')
      return
    }

    try {
      setSaving(true)

      const response = await fetch(
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
              email.trim() || null,
            phone:
              phone.trim() || null,
            address:
              address.trim() || null,
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
        'Data pelanggan berhasil diperbarui.',
      )

      setModal(null)

      await loadCustomer()
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

  const deleteCustomer = async () => {
    if (!customer) return

    try {
      setSaving(true)

      const response = await fetch(
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

  const initials = useMemo(() => {
    if (!customer?.name) return '?'

    const parts =
      customer.name
        .trim()
        .split(/\s+/)

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase()
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase()
  }, [customer])

  const formatDate = (
    date?: string | null,
  ) => {
    if (!date) return '-'

    const parsed = new Date(date)

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return date
    }

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    ).format(parsed)
  }

  const formatDateTime = (
    date?: string | null,
  ) => {
    if (!date) return '-'

    const parsed = new Date(date)

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return date
    }

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(parsed)
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

          <p className="mt-3 text-sm text-muted-foreground">
            Memuat data pelanggan...
          </p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link
          href="/pelanggan"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Pelanggan
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-600">
            Data pelanggan tidak dapat ditampilkan
          </p>

          <p className="mt-2 text-xs text-red-500">
            {error ||
              'Pelanggan tidak ditemukan.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            href="/pelanggan"
            className="hover:text-foreground"
          >
            Pelanggan
          </Link>

          <span>/</span>

          <span className="font-medium text-foreground">
            {customer.name}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-semibold">
              Detail Pelanggan
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Informasi lengkap pelanggan dan aktivitas CRM.
            </p>
          </div>

          <Link
            href="/pelanggan"
            className="inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>

        </div>
      </div>

      {/* PROFILE */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center">

          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">
            {initials}
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">
                {customer.name}
              </h2>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
                Customer
              </span>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">

              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5" />
                  {customer.email}
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5" />
                  {customer.phone}
                </div>
              )}

              {customer.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5" />
                  {customer.address}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                Bergabung {formatDate(customer.created_at)}
              </div>

            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={openEdit}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted"
            >
              <Edit className="size-4" />
              Edit
            </button>

            <Link
              href={`/chat?customer_id=${customer.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <MessageSquare className="size-4" />
              Chat
            </Link>

          </div>

        </div>
      </section>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">

        <KpiCard
          icon={
            <Target className="size-4" />
          }
          label="Total Lead"
          value={String(leads.length)}
        />

        <KpiCard
          icon={
            <MessageSquare className="size-4" />
          }
          label="Total Chat"
          value={String(chats.length)}
        />

        <KpiCard
          icon={
            <ShoppingBag className="size-4" />
          }
          label="Produk Diminati"
          value={String(
            new Set(
              leads.map(
                (lead) =>
                  lead.product_id,
              ),
            ).size,
          )}
        />

      </div>

      {/* CONTENT */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEADS */}
        <section className="rounded-2xl border bg-card shadow-sm lg:col-span-2">

          <div className="border-b p-5">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-sm font-semibold">
                  Produk & Lead
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Produk yang diminati pelanggan.
                </p>
              </div>

              <Target className="size-4 text-muted-foreground" />

            </div>
          </div>

          {leads.length === 0 ? (
            <div className="p-10 text-center">

              <Target className="mx-auto size-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                Belum ada lead
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Pelanggan ini belum memiliki lead.
              </p>

            </div>
          ) : (
            <div className="divide-y">

              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
                >

                  {lead.product_image ? (
                    <img
                      src={lead.product_image}
                      alt={
                        lead.product_name ||
                        'Produk'
                      }
                      className="size-14 shrink-0 rounded-xl border object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <ShoppingBag className="size-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold">
                      {lead.product_name ||
                        'Produk'}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {lead.product_category ||
                        'Tanpa kategori'}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDateTime(
                        lead.created_at,
                      )}

                      {lead.source && (
                        <>
                          <span>•</span>
                          <span>
                            {lead.source}
                          </span>
                        </>
                      )}
                    </div>

                  </div>

                  <LeadBadge
                    status={lead.status}
                  />

                </div>
              ))}

            </div>
          )}

        </section>

        {/* SUMMARY */}
        <section className="rounded-2xl border bg-card shadow-sm">

          <div className="border-b p-5">
            <h2 className="text-sm font-semibold">
              Ringkasan Customer
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Informasi CRM pelanggan.
            </p>
          </div>

          <div className="space-y-5 p-5">

            <InfoRow
              icon={
                <User className="size-4" />
              }
              label="Nama"
              value={customer.name}
            />

            <InfoRow
              icon={
                <Mail className="size-4" />
              }
              label="Email"
              value={
                customer.email ||
                'Belum diisi'
              }
            />

            <InfoRow
              icon={
                <Phone className="size-4" />
              }
              label="Telepon"
              value={
                customer.phone ||
                'Belum diisi'
              }
            />

            <InfoRow
              icon={
                <MapPin className="size-4" />
              }
              label="Alamat"
              value={
                customer.address ||
                'Belum diisi'
              }
            />

            <InfoRow
              icon={
                <Calendar className="size-4" />
              }
              label="Terdaftar"
              value={formatDate(
                customer.created_at,
              )}
            />

          </div>

        </section>

      </div>

      {/* CHAT PREVIEW */}
      <section className="rounded-2xl border bg-card shadow-sm">

        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-sm font-semibold">
              Percakapan Terakhir
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Riwayat chat pelanggan.
            </p>
          </div>

          <MessageSquare className="size-4 text-muted-foreground" />

        </div>

        {chats.length === 0 ? (
          <div className="p-10 text-center">

            <MessageSquare className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              Belum ada percakapan
            </p>

          </div>
        ) : (
          <div className="divide-y">

            {chats
              .slice(-5)
              .reverse()
              .map((chat) => (
                <div
                  key={chat.id}
                  className="flex gap-3 p-4"
                >

                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                      chat.sender ===
                      'admin'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {chat.sender ===
                    'admin' ? (
                      <Users className="size-3.5" />
                    ) : (
                      <User className="size-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-3">

                      <p className="text-xs font-semibold">
                        {chat.sender ===
                        'admin'
                          ? 'Admin'
                          : customer.name}
                      </p>

                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(
                          chat.created_at,
                        )}
                      </span>

                    </div>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {chat.message}
                    </p>

                  </div>

                </div>
              ))}

          </div>
        )}

      </section>

      {/* DELETE */}
      <div className="flex justify-end">

        <button
          type="button"
          onClick={() =>
            setModal('delete')
          }
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
          Hapus Pelanggan
        </button>

      </div>

      {/* EDIT MODAL */}
      {modal === 'edit' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Tutup"
            onClick={closeModal}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>
                <h2 className="text-sm font-semibold">
                  Edit Pelanggan
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Perbarui informasi pelanggan.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
              >
                <X className="size-4" />
              </button>

            </div>

            <div className="space-y-4 p-5">

              <FormField
                label="Nama"
                value={name}
                onChange={setName}
              />

              <FormField
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
              />

              <FormField
                label="Nomor Telepon"
                value={phone}
                onChange={setPhone}
              />

              <div>
                <label className="text-xs font-medium">
                  Alamat
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value,
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
                onClick={closeModal}
                className="rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={updateCustomer}
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

      {/* DELETE MODAL */}
      {modal === 'delete' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Tutup"
            onClick={closeModal}
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
              Data{' '}
              <strong className="text-foreground">
                {customer.name}
              </strong>{' '}
              akan dihapus dari database.
            </p>

            <div className="mt-5 flex gap-2">

              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border py-2.5 text-xs font-medium hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={deleteCustomer}
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

    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
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

    </div>
  )
}

function InfoRow({
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

      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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

function LeadBadge({
  status,
}: {
  status: string
}) {
  let className =
    'bg-blue-50 text-blue-600'

  if (status === 'Negosiasi') {
    className =
      'bg-amber-50 text-amber-600'
  }

  if (status === 'Hot Lead') {
    className =
      'bg-orange-50 text-orange-600'
  }

  if (status === 'Closing') {
    className =
      'bg-emerald-50 text-emerald-600'
  }

  if (status === 'Tidak Tertarik') {
    className =
      'bg-gray-100 text-gray-500'
  }

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${className}`}
    >
      {status}
    </span>
  )
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
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
          onChange(e.target.value)
        }
        className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary"
      />
    </div>
  )
}