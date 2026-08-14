'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  UserCheck,
  UserX,
  KeyRound,
} from 'lucide-react'
import { DashboardShell } from '@/components/crm/dashboard-shell'

type Customer = {
  id: number
  name: string
  username: string | null
  email: string | null
  phone: string | null
  address: string | null
  status: 'Aktif' | 'Nonaktif'
  created_at: string
  total_leads?: number
  total_chats?: number
}

type ModalType =
  | 'add'
  | 'edit'
  | 'delete'
  | null

export default function PelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')

  const [modal, setModal] =
    useState<ModalType>(null)

  const [selected, setSelected] =
    useState<Customer | null>(null)

  const [name, setName] = useState('')
  const [username, setUsername] =
    useState('')
  const [password, setPassword] =
    useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] =
    useState('')
  const [status, setStatus] =
    useState<'Aktif' | 'Nonaktif'>('Aktif')
  const [role, setRole] = useState<'customer' | 'admin'>('customer')

  const [saving, setSaving] =
    useState(false)

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        '/api/customers',
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
            'Gagal mengambil data pelanggan.',
        )
      }

      const data =
        Array.isArray(
          result.data?.customers,
        )
          ? result.data.customers
          : Array.isArray(
                result.customers,
              )
            ? result.customers
            : Array.isArray(
                  result.data,
                )
              ? result.data
              : []

      setCustomers(data)
    } catch (err) {
      console.error(
        'LOAD CUSTOMERS ERROR:',
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
    loadCustomers()
  }, [])

  // =====================================================
  // FILTER
  // =====================================================

  const filteredCustomers =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim()

      if (!keyword) {
        return customers
      }

      return customers.filter(
        (customer) => {
          return (
            customer.name
              ?.toLowerCase()
              .includes(keyword) ||
            customer.username
              ?.toLowerCase()
              .includes(keyword) ||
            customer.email
              ?.toLowerCase()
              .includes(keyword) ||
            customer.phone
              ?.toLowerCase()
              .includes(keyword) ||
            customer.address
              ?.toLowerCase()
              .includes(keyword)
          )
        },
      )
    }, [customers, search])

  // =====================================================
  // STATISTICS
  // =====================================================

  const activeCustomers =
    useMemo(() => {
      return customers.filter(
        (customer) =>
          customer.status ===
          'Aktif',
      ).length
    }, [customers])

  const inactiveCustomers =
    useMemo(() => {
      return customers.filter(
        (customer) =>
          customer.status ===
          'Nonaktif',
      ).length
    }, [customers])

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setName('')
    setUsername('')
    setPassword('')
    setEmail('')
    setPhone('')
    setAddress('')
    setStatus('Aktif')
    setRole('customer')
  }

  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAdd = () => {
    resetForm()
    setSelected(null)
    setModal('add')
  }

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEdit = (
    customer: Customer,
  ) => {
    setSelected(customer)

    setName(customer.name || '')
    setUsername(
      customer.username || '',
    )

    // Password sengaja kosong
    // agar password lama tetap digunakan
    setPassword('')

    setEmail(customer.email || '')
    setPhone(customer.phone || '')
    setAddress(
      customer.address || '',
    )

    setStatus(
      customer.status ||
        'Aktif',
    )

    setModal('edit')
  }

  // =====================================================
  // OPEN DELETE
  // =====================================================

  const openDelete = (
    customer: Customer,
  ) => {
    setSelected(customer)
    setModal('delete')
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    resetForm()
  }

  // =====================================================
  // SAVE CUSTOMER
  // =====================================================

  const saveCustomer = async () => {
    if (!name.trim()) {
      alert(
        'Nama pelanggan wajib diisi.',
      )
      return
    }

    if (!username.trim()) {
      alert(
        'Username wajib diisi.',
      )
      return
    }

    /*
     * Password wajib saat tambah.
     * Saat edit boleh kosong karena
     * berarti tidak mengubah password.
     */
    if (
      modal === 'add' &&
      !password.trim()
    ) {
      alert(
        'Password wajib diisi.',
      )
      return
    }

    if (
      username.trim().length < 3
    ) {
      alert(
        'Username minimal 3 karakter.',
      )
      return
    }

    if (
      password.trim() &&
      password.trim().length < 6
    ) {
      alert(
        'Password minimal 6 karakter.',
      )
      return
    }

    try {
      setSaving(true)

      const payload: Record<
        string,
        unknown
      > = {
        name: name.trim(),
        username:
          username.trim(),
        email:
          email.trim() || null,
        phone:
          phone.trim() || null,
        address:
          address.trim() || null,
        status,
        role,
      }

      /*
       * Password hanya dikirim jika:
       * - tambah customer
       * - atau edit dan password diisi
       */
      if (password.trim()) {
        payload.password =
          password.trim()
      }

      const isEdit =
        modal === 'edit'

      if (
        isEdit &&
        selected?.id
      ) {
        payload.id =
          selected.id
      }

      const response =
        await fetch(
          '/api/customers',
          {
            method: isEdit
              ? 'PUT'
              : 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              payload,
            ),
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
            `Gagal ${
              isEdit
                ? 'mengubah'
                : 'menambahkan'
            } pelanggan.`,
        )
      }

      alert(
        isEdit
          ? 'Pelanggan berhasil diperbarui!'
          : 'Pelanggan berhasil ditambahkan!',
      )

      closeModal()

      await loadCustomers()
    } catch (err) {
      console.error(
        'SAVE CUSTOMER ERROR:',
        err,
      )

      alert(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan pelanggan.',
      )
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // DELETE CUSTOMER
  // =====================================================

  const deleteCustomer =
    async () => {
      if (!selected) {
        return
      }

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
                id: selected.id,
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

        closeModal()

        await loadCustomers()
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
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date: string,
  ) => {
    if (!date) {
      return '-'
    }

    const parsed =
      new Date(date)

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
      },
    ).format(parsed)
  }

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (
    customerName: string,
  ) => {
    const parts =
      customerName
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (
      parts.length === 0
    ) {
      return '?'
    }

    if (
      parts.length === 1
    ) {
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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <DashboardShell activeItem="pelanggan">
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>CRM</span>
              <span>/</span>
              <span>Pelanggan</span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Pelanggan
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Kelola seluruh akun dan
              data pelanggan CRM
              Marketplace.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="size-4" />
            Tambah Pelanggan
          </button>

        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Pelanggan"
            value={
              customers.length
            }
            icon={
              <Users className="size-4" />
            }
          />

          <StatCard
            label="Pelanggan Aktif"
            value={
              activeCustomers
            }
            icon={
              <UserCheck className="size-4" />
            }
          />

          <StatCard
            label="Pelanggan Nonaktif"
            value={
              inactiveCustomers
            }
            icon={
              <UserX className="size-4" />
            }
          />

          <StatCard
            label="Hasil Pencarian"
            value={
              filteredCustomers.length
            }
            icon={
              <Search className="size-4" />
            }
          />

        </div>

        {/* =================================================
            CUSTOMER TABLE / LIST
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-sm font-semibold">
                Daftar Pelanggan
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Klik nama pelanggan
                untuk melihat detail.
              </p>
            </div>

            <div className="relative w-full md:w-80">

              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Cari nama, username, email..."
                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none transition focus:border-primary"
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}

              <button
                type="button"
                onClick={
                  loadCustomers
                }
                className="ml-3 font-semibold underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="p-12 text-center">

              <div className="mx-auto size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />

              <p className="mt-3 text-xs text-muted-foreground">
                Memuat data
                pelanggan...
              </p>

            </div>
          ) : filteredCustomers.length ===
            0 ? (
            <div className="p-12 text-center">

              <Users className="mx-auto size-9 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                {search
                  ? 'Pelanggan tidak ditemukan'
                  : 'Belum ada pelanggan'}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {search
                  ? 'Coba gunakan kata pencarian lain.'
                  : 'Tambahkan pelanggan pertama kamu.'}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={
                    openAdd
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground"
                >
                  <Plus className="size-3.5" />
                  Tambah Pelanggan
                </button>
              )}

            </div>
          ) : (

            <div className="divide-y">

              {filteredCustomers.map(
                (customer) => (

                  <div
                    key={
                      customer.id
                    }
                    className="group flex flex-col gap-4 p-5 transition hover:bg-muted/20 lg:flex-row lg:items-center"
                  >

                    {/* AVATAR */}

                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(
                        customer.name,
                      )}
                    </div>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        {/* NAMA KLIK -> DETAIL */}

                        <Link
                          href={`/pelanggan/detail?id=${customer.id}`}
                          className="text-sm font-semibold hover:text-primary hover:underline"
                        >
                          {
                            customer.name
                          }
                        </Link>

                        {/* STATUS */}

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                            customer.status ===
                            'Aktif'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {
                            customer.status
                          }
                        </span>

                      </div>

                      {/* USERNAME */}

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <KeyRound className="size-3.5" />

                        <span>
                          {customer.username ||
                            'Belum memiliki username'}
                        </span>
                      </div>

                      {/* CONTACT */}

                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">

                        {customer.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="size-3.5" />
                            {
                              customer.email
                            }
                          </span>
                        )}

                        {customer.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="size-3.5" />
                            {
                              customer.phone
                            }
                          </span>
                        )}

                        {customer.address && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {
                              customer.address
                            }
                          </span>
                        )}

                      </div>

                    </div>

                    {/* DATE */}

                    <div className="min-w-[110px]">

                      <p className="text-[10px] text-muted-foreground">
                        Bergabung
                      </p>

                      <p className="mt-1 text-xs font-medium">
                        {formatDate(
                          customer.created_at,
                        )}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-wrap items-center gap-2">

                      <Link
                        href={`/pelanggan/detail?id=${customer.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition hover:bg-muted"
                      >
                        <Eye className="size-3.5" />
                        Detail
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            customer,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition hover:bg-muted"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openDelete(
                            customer,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus
                      </button>

                    </div>

                  </div>

                ),
              )}

            </div>

          )}

        </section>

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {(modal === 'add' ||
        modal === 'edit') && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Tutup"
            onClick={
              closeModal
            }
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          />

          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h2 className="text-sm font-semibold">
                  {modal ===
                  'add'
                    ? 'Tambah Pelanggan'
                    : 'Edit Pelanggan'}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {modal ===
                  'add'
                    ? 'Buat akun pelanggan baru.'
                    : 'Perbarui data dan akun pelanggan.'}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="flex size-8 items-center justify-center rounded-lg border transition hover:bg-muted"
              >
                <X className="size-4" />
              </button>

            </div>

            {/* FORM */}

            <div className="flex-1 overflow-y-auto p-5">

              <div className="space-y-4">

                {/* NAMA */}

                <Field
                  label="Nama Pelanggan"
                  value={name}
                  onChange={
                    setName
                  }
                  placeholder="Contoh: Daniel Afandi"
                  required
                />

                {/* USERNAME */}

                <Field
                  label="Username"
                  value={
                    username
                  }
                  onChange={
                    setUsername
                  }
                  placeholder="Contoh: daniel123"
                  required
                />

                {/* PASSWORD */}

                <div>

                  <label className="text-xs font-medium">
                    Password
                    {modal ===
                      'add' && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </label>

                  <input
                    type="password"
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder={
                      modal ===
                      'edit'
                        ? 'Kosongkan jika tidak ingin mengubah password'
                        : 'Minimal 6 karakter'
                    }
                    className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none transition focus:border-primary"
                  />

                  {modal ===
                    'edit' && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Kosongkan jika ingin
                      mempertahankan
                      password lama.
                    </p>
                  )}

                </div>

                {/* ROLE */}

                <div>
                  <label className="text-xs font-medium">Jenis Akun</label>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as 'customer' | 'admin')}
                    disabled={modal === 'edit'}
                    className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary disabled:opacity-60"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-1 text-[10px] text-muted-foreground">Admin hanya membuat akun login dan tidak masuk daftar pelanggan.</p>
                </div>

                {/* STATUS */}

                <div>

                  <label className="text-xs font-medium">
                    Status Akun
                  </label>

                  <select
                    value={
                      status
                    }
                    onChange={(
                      event,
                    ) =>
                      setStatus(
                        event
                          .target
                          .value as
                          | 'Aktif'
                          | 'Nonaktif',
                      )
                    }
                    className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none transition focus:border-primary"
                  >

                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Nonaktif">
                      Nonaktif
                    </option>

                  </select>

                </div>

                {/* EMAIL */}

                <Field
                  label="Email"
                  value={
                    email
                  }
                  onChange={
                    setEmail
                  }
                  placeholder="customer@email.com"
                  type="email"
                />

                {/* PHONE */}

                <Field
                  label="Nomor Telepon"
                  value={
                    phone
                  }
                  onChange={
                    setPhone
                  }
                  placeholder="08xxxxxxxxxx"
                />

                {/* ADDRESS */}

                <div>

                  <label className="text-xs font-medium">
                    Alamat
                  </label>

                  <textarea
                    value={
                      address
                    }
                    onChange={(
                      event,
                    ) =>
                      setAddress(
                        event
                          .target
                          .value,
                      )
                    }
                    rows={3}
                    placeholder="Alamat pelanggan..."
                    className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 text-xs outline-none transition focus:border-primary"
                  />

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-2 border-t p-5">

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="rounded-xl border px-4 py-2.5 text-xs font-medium transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  saveCustomer
                }
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {saving
                  ? 'Menyimpan...'
                  : modal ===
                      'add'
                    ? 'Simpan Pelanggan'
                    : 'Simpan Perubahan'}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {modal ===
        'delete' &&
        selected && (

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
                  {
                    selected.name
                  }
                </strong>{' '}

                akan dihapus
                dari database.

              </p>

              <div className="mt-5 flex gap-2">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="flex-1 rounded-xl border py-2.5 text-xs font-medium transition hover:bg-muted"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    deleteCustomer
                  }
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
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
// STAT CARD
// =====================================================

function StatCard({
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

      <p className="mt-1 text-[11px] text-muted-foreground">
        Data dari database
      </p>

    </div>
  )
}

// =====================================================
// FIELD
// =====================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (
    value: string,
  ) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>

      <label className="text-xs font-medium">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none transition focus:border-primary"
      />

    </div>
  )
}