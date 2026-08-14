'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardShell } from '@/components/crm/dashboard-shell'
import {
  AlertCircle,
  Flame,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'

type LeadStatus = 'Tertarik' | 'Negosiasi' | 'Hot Lead' | 'Closing' | 'Tidak Tertarik'

type Lead = {
  id: number
  customer_id: number
  product_id: number
  status: LeadStatus
  source: string | null
  created_at: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  product_name: string
  product_category: string | null
  product_price: number
  product_image: string | null
}

type Customer = { id: number; name: string; email: string | null; phone: string | null }
type Product = { id: number; name: string; category: string | null; price: number; stock: number; image: string | null }

const statuses: LeadStatus[] = ['Tertarik', 'Negosiasi', 'Hot Lead', 'Closing', 'Tidak Tertarik']

export default function LeadPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua Status')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('Tertarik')
  const [source, setSource] = useState('Marketplace')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leads', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Gagal mengambil data lead.')
      setLeads(result.data.leads)
      setCustomers(result.data.customers)
      setProducts(result.data.products)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Gagal mengambil data lead.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return leads.filter((lead) => {
      const matchesSearch = !q ||
        lead.customer_name.toLowerCase().includes(q) ||
        lead.product_name.toLowerCase().includes(q) ||
        (lead.source || '').toLowerCase().includes(q)
      const matchesStatus = filterStatus === 'Semua Status' || lead.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [leads, search, filterStatus])

  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.status === 'Hot Lead').length,
    negotiation: leads.filter((l) => l.status === 'Negosiasi').length,
    closing: leads.filter((l) => l.status === 'Closing').length,
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  const formatDate = (date: string) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))

  const resetForm = () => {
    setCustomerId('')
    setProductId('')
    setLeadStatus('Tertarik')
    setSource('Marketplace')
  }

  const openAdd = () => { resetForm(); setSelected(null); setModal('add') }

  const openEdit = (lead: Lead) => {
    setSelected(lead)
    setCustomerId(String(lead.customer_id))
    setProductId(String(lead.product_id))
    setLeadStatus(lead.status)
    setSource(lead.source || '')
    setModal('edit')
  }

  const saveLead = async () => {
    if (!customerId || !productId) {
      alert('Customer dan produk wajib dipilih.')
      return
    }
    try {
      setSaving(true)
      const response = await fetch('/api/leads', {
        method: modal === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected?.id,
          customer_id: Number(customerId),
          product_id: Number(productId),
          status: leadStatus,
          source,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Gagal menyimpan lead.')
      alert(modal === 'add' ? 'Lead berhasil ditambahkan!' : 'Lead berhasil diperbarui!')
      setModal(null)
      setSelected(null)
      resetForm()
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menyimpan lead.')
    } finally {
      setSaving(false)
    }
  }

  const deleteLead = async () => {
    if (!selected) return
    try {
      const response = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Gagal menghapus lead.')
      alert('Lead berhasil dihapus!')
      setDeleteOpen(false)
      setSelected(null)
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus lead.')
    }
  }

  return (
    <DashboardShell activeItem="lead">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>CRM</span><span>/</span><span>Lead / Minat</span></div>
            <h1 className="mt-2 text-2xl font-semibold">Lead / Minat</h1>
            <p className="mt-1 text-sm text-muted-foreground">Kelola customer yang tertarik dengan produk dan pantau peluang closing.</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"><Plus className="size-4" />Tambah Lead</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Total Lead" value={stats.total} desc="Semua lead" icon={<Target className="size-4" />} />
          <Stat label="Hot Lead" value={stats.hot} desc="Prioritas follow-up" icon={<Flame className="size-4" />} />
          <Stat label="Negosiasi" value={stats.negotiation} desc="Sedang dalam negosiasi" icon={<TrendingUp className="size-4" />} />
          <Stat label="Closing" value={stats.closing} desc="Berhasil closing" icon={<UserRound className="size-4" />} />
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-sm font-semibold">Daftar Lead</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} lead ditampilkan</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari customer / produk..." className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none focus:border-primary sm:w-64" /></div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs outline-none"><option>Semua Status</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
          </div>

          {loading ? <div className="p-12 text-center text-sm text-muted-foreground">Memuat data lead...</div> : filtered.length === 0 ? <div className="p-12 text-center"><Target className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Belum ada lead</p><p className="mt-1 text-xs text-muted-foreground">Klik Tambah Lead untuk membuat data pertama.</p></div> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b bg-muted/20"><tr className="text-[11px] text-muted-foreground"><th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Produk</th><th className="px-5 py-3 font-medium">Harga</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Sumber</th><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 text-right font-medium">Aksi</th></tr></thead>
                <tbody className="divide-y">
                  {filtered.map((lead) => <tr key={lead.id} className="text-xs hover:bg-muted/20">
                    <td className="px-5 py-4"><p className="font-semibold">{lead.customer_name}</p><p className="mt-1 text-[10px] text-muted-foreground">{lead.customer_phone || lead.customer_email || '-'}</p></td>
                    <td className="px-5 py-4"><p className="font-medium">{lead.product_name}</p><p className="mt-1 text-[10px] text-muted-foreground">{lead.product_category || '-'}</p></td>
                    <td className="px-5 py-4 font-semibold text-primary">{formatPrice(Number(lead.product_price))}</td>
                    <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-5 py-4 text-muted-foreground">{lead.source || '-'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(lead.created_at)}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => setSelected(lead)} className="rounded-lg border px-3 py-2 text-[11px] font-medium hover:bg-muted">Detail</button><button onClick={() => openEdit(lead)} className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted"><Pencil className="size-3.5" /></button></div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected && !modal && <div className="fixed inset-0 z-50"><button onClick={() => setSelected(null)} className="absolute inset-0 bg-black/30" aria-label="Tutup" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[11px] text-muted-foreground">Detail Lead #{selected.id}</p><h2 className="mt-1 text-sm font-semibold">{selected.customer_name}</h2></div><button onClick={() => setSelected(null)} className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted"><X className="size-4" /></button></div><div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-4 rounded-2xl border p-4"><div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">{selected.customer_name.split(' ').map((x) => x[0]).slice(0,2).join('')}</div><div><p className="text-sm font-semibold">{selected.customer_name}</p><p className="mt-1 text-xs text-muted-foreground">{selected.customer_phone || selected.customer_email || 'Kontak belum tersedia'}</p></div></div>
        <div className="mt-5 overflow-hidden rounded-2xl border"><div className="aspect-video bg-muted">{selected.product_image ? <img src={selected.product_image} alt={selected.product_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Tidak ada foto produk</div>}</div><div className="p-4"><p className="text-[10px] text-muted-foreground">Produk diminati</p><p className="mt-1 text-sm font-semibold">{selected.product_name}</p><p className="mt-2 text-base font-semibold text-primary">{formatPrice(Number(selected.product_price))}</p></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border p-3"><p className="text-[10px] text-muted-foreground">Status</p><div className="mt-2"><StatusBadge status={selected.status} /></div></div><div className="rounded-xl border p-3"><p className="text-[10px] text-muted-foreground">Sumber</p><p className="mt-2 text-xs font-semibold">{selected.source || '-'}</p></div></div>
        <div className="mt-5 rounded-xl border p-4"><p className="text-[10px] text-muted-foreground">Tanggal Lead</p><p className="mt-1 text-sm font-semibold">{formatDate(selected.created_at)}</p></div>
      </div><div className="space-y-2 border-t p-5"><button onClick={() => openEdit(selected)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90"><Pencil className="size-4" />Edit Lead</button><button onClick={() => setDeleteOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 hover:bg-red-50"><Trash2 className="size-4" />Hapus Lead</button></div></aside></div>}

      {modal && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button onClick={() => setModal(null)} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" aria-label="Tutup" /><div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="text-sm font-semibold">{modal === 'add' ? 'Tambah Lead' : 'Edit Lead'}</h2><p className="mt-1 text-xs text-muted-foreground">Hubungkan customer dengan produk yang diminati.</p></div><button onClick={() => setModal(null)} className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted"><X className="size-4" /></button></div><div className="space-y-4 p-5">
        <Field label="Customer"><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary"><option value="">Pilih customer...</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>)}</select></Field>
        <Field label="Produk"><select value={productId} onChange={(e) => setProductId(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary"><option value="">Pilih produk...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatPrice(Number(p.price))} (stok {p.stock})</option>)}</select></Field>
        <Field label="Status"><select value={leadStatus} onChange={(e) => setLeadStatus(e.target.value as LeadStatus)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary">{statuses.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Sumber Lead"><input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Marketplace, Instagram, WhatsApp..." className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary" /></Field>
      </div><div className="flex justify-end gap-2 border-t p-5"><button onClick={() => setModal(null)} className="rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted">Batal</button><button disabled={saving} onClick={saveLead} className="rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">{saving ? 'Menyimpan...' : modal === 'add' ? 'Simpan Lead' : 'Simpan Perubahan'}</button></div></div></div>}

      {deleteOpen && selected && <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"><button onClick={() => setDeleteOpen(false)} className="absolute inset-0 bg-black/30" aria-label="Tutup" /><div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-5 shadow-2xl"><div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500"><AlertCircle className="size-5" /></div><h3 className="mt-4 text-sm font-semibold">Hapus Lead?</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">Lead <strong>#{selected.id}</strong> untuk {selected.customer_name} akan dihapus.</p><div className="mt-5 flex gap-2"><button onClick={() => setDeleteOpen(false)} className="flex-1 rounded-xl border py-2.5 text-xs font-medium hover:bg-muted">Batal</button><button onClick={deleteLead} className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-medium text-white hover:opacity-90">Hapus</button></div></div></div>}
    </DashboardShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium">{label}</label><div className="mt-2">{children}</div></div>
}

function Stat({ label, value, desc, icon }: { label: string; value: number; desc: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{label}</p><div className="text-muted-foreground">{icon}</div></div><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{desc}</p></div>
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const styles: Record<LeadStatus, string> = {
    Tertarik: 'bg-blue-50 text-blue-600',
    Negosiasi: 'bg-amber-50 text-amber-600',
    'Hot Lead': 'bg-red-50 text-red-600',
    Closing: 'bg-emerald-50 text-emerald-600',
    'Tidak Tertarik': 'bg-gray-100 text-gray-500',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}>{status}</span>
}
