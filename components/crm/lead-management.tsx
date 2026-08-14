'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  Filter,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  UserRound,
  BellRing,
  TrendingUp,
  X,
} from 'lucide-react'
import { Card, CardHead } from '@/components/crm/ui'
import { LeadBadge } from '@/components/crm/badges'
import { Dropdown } from '@/components/crm/dropdown'
import { Avatar } from '@/components/crm/badges'
import { cn } from '@/lib/utils'
import type { StatusLead } from '@/lib/crm-data'

const leads = [
  { id: 'l1', pelanggan: 'Umar Hakim', produk: 'Laptop ASUS X', harga: 'Rp 7.000.000', tanggal: '13 Agu 2026', status: 'Tertarik' as StatusLead, interaksi: '5 menit lalu', followUp: '15 Agu 2026', value: 'Rp 7.000.000' },
  { id: 'l2', pelanggan: 'Budi Santoso', produk: 'Keyboard Mechanical', harga: 'Rp 350.000', tanggal: '13 Agu 2026', status: 'Follow-Up' as StatusLead, interaksi: '10 menit lalu', followUp: '14 Agu 2026', value: 'Rp 350.000' },
  { id: 'l3', pelanggan: 'Citra Amelia', produk: 'Mouse Wireless', harga: 'Rp 150.000', tanggal: '12 Agu 2026', status: 'Negosiasi' as StatusLead, interaksi: '30 menit lalu', followUp: '14 Agu 2026', value: 'Rp 150.000' },
  { id: 'l4', pelanggan: 'Dewi Lestari', produk: 'Headset Gaming', harga: 'Rp 850.000', tanggal: '11 Agu 2026', status: 'Deal' as StatusLead, interaksi: '1 jam lalu', followUp: 'Selesai', value: 'Rp 850.000' },
  { id: 'l5', pelanggan: 'Rian Pratama', produk: 'Smartphone Xiaomi', harga: 'Rp 3.200.000', tanggal: '10 Agu 2026', status: 'Tertarik' as StatusLead, interaksi: '2 jam lalu', followUp: '16 Agu 2026', value: 'Rp 3.200.000' },
]

const productInterest = [
  ['Laptop ASUS X', 42],
  ['Keyboard Mechanical', 35],
  ['Mouse Wireless', 27],
  ['Headset Gaming', 18],
  ['Smartphone Xiaomi', 13],
]

const stages: { label: string; count: number; tone: string }[] = [
  { label: 'Tertarik', count: 45, tone: 'bg-status-tertarik' },
  { label: 'Dihubungi', count: 32, tone: 'bg-status-followup' },
  { label: 'Negosiasi', count: 18, tone: 'bg-status-negosiasi' },
  { label: 'Deal', count: 42, tone: 'bg-status-deal' },
]

export function LeadManagement() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Semua')
  const [product, setProduct] = useState('Semua Produk')
  const [selected, setSelected] = useState<(typeof leads)[number] | null>(null)

  const filtered = useMemo(() => leads.filter((lead) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || lead.pelanggan.toLowerCase().includes(q) || lead.produk.toLowerCase().includes(q)
    const matchesStatus = status === 'Semua' || lead.status === status
    const matchesProduct = product === 'Semua Produk' || lead.produk === product
    return matchesSearch && matchesStatus && matchesProduct
  }), [search, status, product])

  const reset = () => {
    setSearch('')
    setStatus('Semua')
    setProduct('Semua Produk')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Dashboard</span><ChevronRight className="size-3" /><span>Lead &amp; Minat</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Lead &amp; Minat Pelanggan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola pelanggan yang tertarik dengan produk dan pantau perjalanan mereka.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted"><Plus className="size-4" /> Tambah Lead</button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"><TrendingUp className="size-4" /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <MiniStat label="Total Lead" value="128" />
        <MiniStat label="Lead Baru" value="45" />
        <MiniStat label="Perlu Follow-Up" value="23" />
        <MiniStat label="Sedang Negosiasi" value="18" />
        <MiniStat label="Berhasil Deal" value="42" />
      </div>

      <Card className="overflow-hidden">
        <CardHead title="Lead Pipeline" subtitle="Pantau perpindahan lead dari minat hingga berhasil deal." />
        <div className="grid gap-3 p-5 md:grid-cols-4">
          {stages.map((stage, i) => (
            <div key={stage.label} className="relative rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className={cn('size-2.5 rounded-full', stage.tone)} /><span className="text-xs font-medium text-muted-foreground">{stage.label}</span></div>
                <span className="text-lg font-bold text-foreground">{stage.count}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', stage.tone)} style={{ width: `${Math.min(stage.count / 45 * 100, 100)}%` }} /></div>
              {i < stages.length - 1 && <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-card text-muted-foreground md:block" />}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 p-5 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama pelanggan atau produk..." className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <Dropdown options={['Semua', 'Tertarik', 'Follow-Up', 'Negosiasi', 'Deal']} value={status} onChange={setStatus} triggerClassName="h-10 px-3.5" />
          <Dropdown options={['Semua Produk', 'Laptop ASUS X', 'Keyboard Mechanical', 'Mouse Wireless', 'Headset Gaming', 'Smartphone Xiaomi']} value={product} onChange={setProduct} triggerClassName="h-10 px-3.5" />
          <Dropdown options={['30 Hari Terakhir', 'Hari Ini', '7 Hari Terakhir', 'Custom']} triggerClassName="h-10 px-3.5" />
          <button onClick={reset} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted"><RotateCcw className="size-3.5" /> Reset</button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHead title="Daftar Lead" subtitle={`${filtered.length} lead ditampilkan`} action={<button className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted sm:inline-flex"><Filter className="size-3.5" /> Filter</button>} />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-sm">
            <thead><tr className="border-y border-border bg-muted/30 text-left text-xs text-muted-foreground">
              {['Customer','Produk','Harga','Tanggal Minat','Status','Last Interaction','Follow-Up','Potential Value','Aksi'].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-border transition hover:bg-muted/30">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><Avatar name={lead.pelanggan} /><span className="font-medium text-foreground">{lead.pelanggan}</span></div></td>
                  <td className="px-5 py-3.5 text-muted-foreground">{lead.produk}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{lead.harga}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{lead.tanggal}</td>
                  <td className="px-5 py-3.5"><LeadBadge status={lead.status} /></td>
                  <td className="px-5 py-3.5 text-muted-foreground">{lead.interaksi}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{lead.followUp}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{lead.value}</td>
                  <td className="px-5 py-3.5"><button onClick={() => setSelected(lead)} className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary" aria-label="Lihat detail"><MoreHorizontal className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="px-5 py-12 text-center text-sm text-muted-foreground">Tidak ada lead yang sesuai dengan filter.</div>}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3"><CardHead title="Produk Paling Banyak Diminati" subtitle="Produk dengan jumlah peminat tertinggi." /><div className="space-y-4 p-5">
          {productInterest.map(([name, value], index) => <div key={name} className="flex items-center gap-3"><span className="w-5 text-xs font-semibold text-muted-foreground">{index + 1}</span><span className="w-40 truncate text-sm font-medium text-foreground">{name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Number(value) / 42 * 100}%` }} /></div><span className="w-16 text-right text-xs text-muted-foreground">{value} peminat</span></div>)}
        </div></Card>
        <Card className="lg:col-span-2"><CardHead title="Lead Conversion" subtitle="Rasio lead yang berhasil menjadi deal." /><div className="flex items-center gap-6 p-5"><div className="relative flex size-28 shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(var(--primary) 0 32.8%, var(--muted) 32.8% 100%)' }}><div className="flex size-20 items-center justify-center rounded-full bg-card"><span className="text-xl font-bold text-foreground">32,8%</span></div></div><div><p className="text-sm font-semibold text-foreground">42 dari 128 lead</p><p className="mt-1 text-xs leading-5 text-muted-foreground">32,8% lead berhasil dikonversi menjadi pelanggan.</p></div></div></Card>
      </div>

      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p></div>
}

function LeadDetail({ lead, onClose }: { lead: (typeof leads)[number]; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] flex justify-end bg-foreground/30" onClick={onClose}>
    <aside className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Detail Lead</p><h2 className="mt-1 text-lg font-semibold text-foreground">{lead.pelanggan}</h2></div><button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><X className="size-4" /></button></div>
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4"><Avatar name={lead.pelanggan} className="size-11" /><div><p className="font-medium text-foreground">{lead.pelanggan}</p><p className="text-xs text-muted-foreground">Pelanggan aktif</p></div></div>
      <div className="mt-4 grid grid-cols-2 gap-3"><Info label="Produk" value={lead.produk} /><Info label="Harga" value={lead.harga} /><Info label="Tanggal Minat" value={lead.tanggal} /><Info label="Potential Value" value={lead.value} /></div>
      <div className="mt-5 rounded-xl border border-border p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-foreground">Status Lead</p><LeadBadge status={lead.status} /></div><div className="mt-4 space-y-3">{['Tertarik', 'Dihubungi', 'Negosiasi', 'Deal'].map((stage, i) => <div key={stage} className="flex items-center gap-3 text-xs"><span className={cn('flex size-6 items-center justify-center rounded-full', i <= ['Tertarik','Dihubungi','Negosiasi','Deal'].indexOf(lead.status) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{i <= ['Tertarik','Dihubungi','Negosiasi','Deal'].indexOf(lead.status) ? <Check className="size-3.5" /> : i + 1}</span><span className={i <= ['Tertarik','Dihubungi','Negosiasi','Deal'].indexOf(lead.status) ? 'font-medium text-foreground' : 'text-muted-foreground'}>{stage}</span></div>)}</div></div>
      <div className="mt-5"><p className="text-sm font-semibold text-foreground">Customer Journey</p><div className="mt-3 space-y-4 border-l border-border pl-4"><Journey icon={<HeartIcon />} text={`Customer tertarik dengan ${lead.produk}`} time="13 Agu · 10:15" /><Journey icon={<MessageSquare className="size-4" />} text="Customer mengirim pesan kepada admin" time="13 Agu · 10:30" /><Journey icon={<BellRing className="size-4" />} text="Admin melakukan follow-up" time="13 Agu · 11:00" /></div></div>
      <div className="mt-6 grid grid-cols-2 gap-2"><button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><MessageSquare className="size-3.5" /> Chat Customer</button><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"><BellRing className="size-3.5" /> Follow-Up</button></div>
    </aside>
  </div>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-xs font-semibold text-foreground">{value}</p></div> }
function Journey({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) { return <div className="relative"><span className="absolute -left-[25px] flex size-6 items-center justify-center rounded-full border border-border bg-card text-primary">{icon}</span><p className="text-xs font-medium text-foreground">{text}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{time}</p></div> }
function HeartIcon() { return <span className="text-xs">♥</span> }
