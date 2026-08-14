'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { DashboardShell } from '@/components/crm/dashboard-shell'

type Priority = 'Tinggi' | 'Sedang' | 'Rendah'
type Status = 'Menunggu' | 'Hari Ini' | 'Terlambat' | 'Selesai'

type FollowUp = {
  id: number
  customer_id: number
  lead_id: number | null
  scheduled_date: string
  scheduled_time: string | null
  priority: Priority
  status: Status
  note: string | null
  customer_name: string
  customer_email: string | null
  product_name: string | null
  lead_status: string | null
}

type Customer = {
  id: number
  name: string
  email: string | null
}

type LeadOption = {
  id: number
  customer_id: number
  customer_name: string
  product_id: number
  product_name: string
  status: string
}

const priorities: Priority[] = ['Tinggi', 'Sedang', 'Rendah']

export default function FollowUpPage() {
  const [items, setItems] = useState<FollowUp[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [leads, setLeads] = useState<LeadOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('Semua Prioritas')
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [selected, setSelected] = useState<FollowUp | null>(null)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [customerId, setCustomerId] = useState('')
  const [leadId, setLeadId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [priority, setPriority] = useState<Priority>('Sedang')
  const [formStatus, setFormStatus] = useState<Status>('Menunggu')
  const [note, setNote] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Gagal mengambil data.')
      setItems(result.followUps || [])
      setCustomers(result.customers || [])
      setLeads(result.leads || [])
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Gagal mengambil data follow-up.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim()
    return items.filter((item) => {
      const matchSearch =
        !keyword ||
        item.customer_name.toLowerCase().includes(keyword) ||
        (item.product_name || '').toLowerCase().includes(keyword) ||
        (item.note || '').toLowerCase().includes(keyword)

      const matchPriority =
        priorityFilter === 'Semua Prioritas' || item.priority === priorityFilter

      const matchStatus =
        statusFilter === 'Semua Status' || item.status === statusFilter

      return matchSearch && matchPriority && matchStatus
    })
  }, [items, search, priorityFilter, statusFilter])

  const stats = {
    total: items.length,
    high: items.filter((x) => x.priority === 'Tinggi' && x.status !== 'Selesai').length,
    today: items.filter((x) => x.status === 'Hari Ini').length,
    late: items.filter((x) => x.status === 'Terlambat').length,
    done: items.filter((x) => x.status === 'Selesai').length,
  }

  const resetForm = () => {
    setCustomerId('')
    setLeadId('')
    setDate(new Date().toISOString().slice(0, 10))
    setTime('10:00')
    setPriority('Sedang')
    setFormStatus('Menunggu')
    setNote('')
  }

  const openAdd = () => {
    resetForm()
    setModal('add')
  }

  const openEdit = () => {
    if (!selected) return
    setCustomerId(String(selected.customer_id))
    setLeadId(selected.lead_id ? String(selected.lead_id) : '')
    setDate(selected.scheduled_date.slice(0, 10))
    setTime(selected.scheduled_time?.slice(0, 5) || '')
    setPriority(selected.priority)
    setFormStatus(selected.status)
    setNote(selected.note || '')
    setModal('edit')
  }

  const save = async () => {
    if (!customerId || !date) {
      alert('Customer dan tanggal wajib diisi.')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/follow-ups', {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modal === 'edit' ? selected?.id : undefined,
          customer_id: Number(customerId),
          lead_id: leadId ? Number(leadId) : null,
          scheduled_date: date,
          scheduled_time: time || null,
          priority,
          status: formStatus,
          note: note.trim() || null,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Gagal menyimpan.')

      setModal(null)
      setSelected(null)
      resetForm()
      await loadData()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Gagal menyimpan follow-up.')
    } finally {
      setSaving(false)
    }
  }

  const markDone = async (item: FollowUp) => {
    try {
      const response = await fetch('/api/follow-ups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: 'Selesai' }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Gagal mengubah status.')
      setSelected(null)
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal mengubah status.')
    }
  }

  const remove = async () => {
    if (!selected) return
    try {
      const response = await fetch('/api/follow-ups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Gagal menghapus.')
      setDeleteOpen(false)
      setSelected(null)
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus follow-up.')
    }
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value.slice(0, 10)}T00:00:00`))

  return (
    <DashboardShell activeItem="followup">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>CRM</span><span>/</span><span>Follow-Up</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold">Follow-Up</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Atur jadwal follow-up customer dan pantau tindak lanjut lead.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Plus className="size-4" /> Tambah Follow-Up
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Follow-Up" value={stats.total} icon={<BellRing className="size-4" />} />
          <StatCard label="Prioritas Tinggi" value={stats.high} icon={<AlertTriangle className="size-4" />} warning />
          <StatCard label="Hari Ini" value={stats.today} icon={<CalendarDays className="size-4" />} />
          <StatCard label="Terlambat" value={stats.late} icon={<Clock3 className="size-4" />} danger />
          <StatCard label="Selesai" value={stats.done} icon={<CheckCircle2 className="size-4" />} />
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Daftar Follow-Up</h2>
              <p className="mt-1 text-xs text-muted-foreground">{filtered.length} follow-up ditampilkan</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari customer / produk..."
                  className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none focus:border-primary sm:w-60"
                />
              </div>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs outline-none">
                <option>Semua Prioritas</option>
                {priorities.map((x) => <option key={x}>{x}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs outline-none">
                <option>Semua Status</option>
                {(['Menunggu', 'Hari Ini', 'Terlambat', 'Selesai'] as Status[]).map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Memuat data follow-up...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <BellRing className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Belum ada follow-up</p>
              <p className="mt-1 text-xs text-muted-foreground">Tambahkan jadwal follow-up pertama.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 p-5 transition hover:bg-muted/20 lg:flex-row lg:items-center">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{item.customer_name}</h3>
                      <PriorityBadge priority={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.product_name ? `Minat: ${item.product_name}` : 'Tidak terkait produk tertentu'}
                    </p>
                    {item.note && <p className="mt-1 truncate text-xs text-muted-foreground">{item.note}</p>}
                  </div>

                  <div className="min-w-[135px]">
                    <p className="text-[11px] text-muted-foreground">Jadwal</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                      <CalendarDays className="size-3.5 text-muted-foreground" />
                      {formatDate(item.scheduled_date)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {item.scheduled_time?.slice(0, 5) || '-'}
                    </p>
                  </div>

                  <button onClick={() => setSelected(item)} className="rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted">
                    Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && !deleteOpen && (
        <div className="fixed inset-0 z-50">
          <button aria-label="Tutup" onClick={() => setSelected(null)} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Detail Follow-Up</p>
                <h2 className="mt-1 text-sm font-semibold">{selected.customer_name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{selected.customer_name}</h3>
                    <p className="text-xs text-muted-foreground">{selected.customer_email || 'Email belum tersedia'}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Info label="Tanggal" value={formatDate(selected.scheduled_date)} />
                  <Info label="Jam" value={selected.scheduled_time?.slice(0, 5) || '-'} />
                  <Info label="Prioritas" value={selected.priority} />
                  <Info label="Status" value={selected.status} />
                </div>

                <div className="mt-4 rounded-xl bg-muted/30 p-4">
                  <p className="text-[11px] font-medium text-muted-foreground">Produk / Lead</p>
                  <p className="mt-1 text-sm font-medium">{selected.product_name || 'Tidak terkait produk'}</p>
                  {selected.lead_status && <p className="mt-1 text-xs text-muted-foreground">Status lead: {selected.lead_status}</p>}
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-medium text-muted-foreground">Catatan</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.note || 'Tidak ada catatan.'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t p-5">
              {selected.status !== 'Selesai' && (
                <button onClick={() => markDone(selected)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:opacity-90">
                  <CheckCircle2 className="size-4" /> Tandai Selesai
                </button>
              )}
              <button onClick={openEdit} className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium hover:bg-muted">
                <Pencil className="size-4" /> Edit Follow-Up
              </button>
              <button onClick={() => setDeleteOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 hover:bg-red-50">
                <Trash2 className="size-4" /> Hapus Follow-Up
              </button>
            </div>
          </aside>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button aria-label="Tutup" onClick={() => setModal(null)} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">{modal === 'add' ? 'Tambah Follow-Up' : 'Edit Follow-Up'}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Atur customer dan jadwal tindak lanjut.</p>
              </div>
              <button onClick={() => setModal(null)} className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <Field label="Customer">
                <select value={customerId} onChange={(e) => { setCustomerId(e.target.value); setLeadId('') }} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary">
                  <option value="">Pilih customer</option>
                  {customers.map((x) => <option key={x.id} value={x.id}>{x.name}{x.email ? ` — ${x.email}` : ''}</option>)}
                </select>
              </Field>

              <Field label="Lead / Produk">
                <select value={leadId} onChange={(e) => { setLeadId(e.target.value); const l = leads.find((x) => String(x.id) === e.target.value); if (l) setCustomerId(String(l.customer_id)) }} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary">
                  <option value="">Tidak terkait lead</option>
                  {leads.filter((x) => !customerId || x.customer_id === Number(customerId)).map((x) => (
                    <option key={x.id} value={x.id}>{x.customer_name} — {x.product_name} ({x.status})</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tanggal">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary" />
                </Field>
                <Field label="Jam">
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Prioritas">
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary">
                    {priorities.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as Status)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary">
                    {(['Menunggu', 'Hari Ini', 'Terlambat', 'Selesai'] as Status[]).map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Catatan">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Contoh: Hubungi customer untuk menawarkan promo..." className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary" />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button onClick={() => setModal(null)} className="rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted">Batal</button>
              <button disabled={saving} onClick={save} className="rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground disabled:opacity-60">
                {saving ? 'Menyimpan...' : modal === 'add' ? 'Simpan Follow-Up' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button aria-label="Tutup" onClick={() => setDeleteOpen(false)} className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-5 shadow-2xl">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash2 className="size-5" /></div>
            <h3 className="mt-4 text-sm font-semibold">Hapus Follow-Up?</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Jadwal follow-up untuk <strong>{selected.customer_name}</strong> akan dihapus.
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDeleteOpen(false)} className="flex-1 rounded-xl border py-2.5 text-xs font-medium hover:bg-muted">Batal</button>
              <button onClick={remove} className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-medium text-white hover:opacity-90">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

function StatCard({ label, value, icon, warning = false, danger = false }: { label: string; value: number; icon: React.ReactNode; warning?: boolean; danger?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${warning ? 'text-amber-500' : danger ? 'text-red-500' : ''}`}>{value}</p>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    Tinggi: 'bg-red-50 text-red-600',
    Sedang: 'bg-amber-50 text-amber-600',
    Rendah: 'bg-slate-100 text-slate-600',
  }
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${styles[priority]}`}>{priority}</span>
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    Menunggu: 'bg-blue-50 text-blue-600',
    'Hari Ini': 'bg-violet-50 text-violet-600',
    Terlambat: 'bg-red-50 text-red-600',
    Selesai: 'bg-emerald-50 text-emerald-600',
  }
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}>{status}</span>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-muted/20 p-3"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium">{label}</label><div className="mt-2">{children}</div></div>
}
