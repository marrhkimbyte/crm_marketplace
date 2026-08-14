'use client'

import {
  Heart,
  MessageSquare,
  Headset,
  ShoppingCart,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Bell,
  Pencil,
  ArrowRight,
  Check,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardHead } from '@/components/crm/ui'
import { LeadBadge, Avatar } from '@/components/crm/badges'
import { cn } from '@/lib/utils'
import {
  customer,
  customerKpis,
  interestedProducts,
  interactionHistory,
  purchaseHistory,
  customerSummary,
  pipelineStages,
  nextFollowUp,
  chatPreview,
  customerInsight,
  type InteractionType,
} from '@/lib/crm-data'

/* ---------- Profile header ---------- */

export function ProfileHeader({
  onChat,
  onFollowUp,
  onEdit,
}: {
  onChat: () => void
  onFollowUp: () => void
  onEdit: () => void
}) {
  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar
            name={customer.nama}
            className="size-16 rounded-full text-lg md:size-20 md:text-xl"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {customer.nama}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-followup px-2.5 py-0.5 text-xs font-semibold text-status-followup-foreground">
                <span className="size-1.5 rounded-full bg-current" />
                {customer.status}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {customer.sejak}
            </p>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
              <span className="inline-flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                {customer.email}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                {customer.telepon}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {customer.lokasi}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onChat}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageSquare className="size-4" />
            Chat
          </button>
          <button
            type="button"
            onClick={onFollowUp}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Bell className="size-4" />
            Follow-Up
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="size-4" />
            Edit
          </button>
        </div>
      </div>
    </Card>
  )
}

/* ---------- Customer KPI ---------- */

export function CustomerKpiCards() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {customerKpis.map((kpi) => (
        <Card key={kpi.id} className="p-5">
          <p className="text-sm text-muted-foreground">{kpi.label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
            {kpi.value}
          </p>
        </Card>
      ))}
    </div>
  )
}

/* ---------- Interested products ---------- */

export function InterestedProducts({
  onView,
  onViewAll,
}: {
  onView: (id: string) => void
  onViewAll: () => void
}) {
  return (
    <Card className="flex flex-col pb-2">
      <CardHead
        title="Produk yang Diminati"
        subtitle="Produk yang pernah ditandai pelanggan sebagai produk yang diminati."
      />
      <ul className="mt-3 divide-y divide-border px-2">
        {interestedProducts.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
          >
            <img
              src={p.gambar || '/placeholder.svg'}
              alt={p.nama}
              className="size-14 shrink-0 rounded-xl border border-border bg-muted object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {p.nama}
              </p>
              <p className="text-sm font-medium text-primary">{p.harga}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.sejak}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <LeadBadge status={p.status} />
              <button
                type="button"
                onClick={() => onView(p.id)}
                className="text-xs font-medium text-primary transition-colors hover:underline"
              >
                Detail
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onViewAll}
        className="mt-2 inline-flex items-center gap-1 self-start px-5 py-3 text-xs font-medium text-primary transition-all hover:gap-2"
      >
        Lihat Semua Produk
        <ArrowRight className="size-3.5" />
      </button>
    </Card>
  )
}

/* ---------- Interaction timeline ---------- */

const interactionMeta: Record<
  InteractionType,
  { icon: LucideIcon; className: string }
> = {
  minat: {
    icon: Heart,
    className: 'bg-status-tertarik text-status-tertarik-foreground',
  },
  chat: {
    icon: MessageSquare,
    className: 'bg-status-deal text-status-deal-foreground',
  },
  followup: { icon: Headset, className: 'bg-accent text-primary' },
  pembelian: {
    icon: ShoppingCart,
    className: 'bg-status-followup text-status-followup-foreground',
  },
  lead: {
    icon: CheckCircle2,
    className: 'bg-status-negosiasi text-status-negosiasi-foreground',
  },
}

export function InteractionTimeline() {
  return (
    <Card className="pb-5">
      <CardHead
        title="Riwayat Interaksi"
        subtitle="Perjalanan pelanggan secara kronologis."
      />
      <ol className="mt-4 px-5">
        {interactionHistory.map((item, i) => {
          const meta = interactionMeta[item.type]
          const Icon = meta.icon
          const last = i === interactionHistory.length - 1
          return (
            <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!last ? (
                <span
                  className="absolute left-[15px] top-9 h-full w-px bg-border"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  'z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                  meta.className,
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm text-foreground">{item.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.tanggal} — {item.jam}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

/* ---------- Purchase history ---------- */

export function PurchaseHistory({
  onView,
}: {
  onView: (id: string) => void
}) {
  return (
    <Card className="flex flex-col pb-4">
      <CardHead title="Riwayat Pembelian" subtitle="Transaksi yang telah selesai." />
      <div className="mt-3 overflow-x-auto px-2">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-3 pb-2 font-medium">ID Transaksi</th>
              <th className="px-3 pb-2 font-medium">Produk</th>
              <th className="px-3 pb-2 font-medium">Tanggal</th>
              <th className="px-3 pb-2 font-medium">Total</th>
              <th className="px-3 pb-2 font-medium">Status</th>
              <th className="px-3 pb-2 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {purchaseHistory.map((trx) => (
              <tr
                key={trx.id}
                className="border-t border-border transition-colors hover:bg-muted/50"
              >
                <td className="px-3 py-2.5 font-medium text-foreground">
                  {trx.id}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {trx.produk}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {trx.tanggal}
                </td>
                <td className="px-3 py-2.5 font-medium text-foreground">
                  {trx.total}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center rounded-full bg-status-followup px-2.5 py-0.5 text-xs font-medium text-status-followup-foreground">
                    {trx.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onView(trx.id)}
                    className="text-xs font-medium text-primary transition-colors hover:underline"
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ---------- Customer summary ---------- */

export function CustomerSummary() {
  return (
    <Card className="pb-5">
      <CardHead title="Ringkasan Pelanggan" />
      <dl className="mt-3 divide-y divide-border px-5">
        {customerSummary.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-sm font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

/* ---------- Lead pipeline ---------- */

export function LeadPipeline({ onUpdate }: { onUpdate: () => void }) {
  return (
    <Card className="pb-5">
      <CardHead title="Status Lead" subtitle="Tahapan pipeline pelanggan." />
      <ol className="mt-4 px-5">
        {pipelineStages.map((stage, i) => {
          const last = i === pipelineStages.length - 1
          return (
            <li key={stage.label} className="relative flex gap-4 pb-5 last:pb-0">
              {!last ? (
                <span
                  className={cn(
                    'absolute left-[13px] top-8 h-full w-0.5',
                    stage.done ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  'z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                  stage.done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {stage.done ? (
                  <Check className="size-4" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <div className="pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    stage.done ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stage.done ? 'Selesai' : 'Belum tercapai'}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
      <div className="px-5">
        <button
          type="button"
          onClick={onUpdate}
          className="mt-1 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Update Status
        </button>
      </div>
    </Card>
  )
}

/* ---------- Next follow-up ---------- */

export function NextFollowUp({
  onComplete,
  onReschedule,
}: {
  onComplete: () => void
  onReschedule: () => void
}) {
  const rows = [
    { label: 'Pelanggan', value: nextFollowUp.pelanggan },
    { label: 'Produk', value: nextFollowUp.produk },
    { label: 'Tanggal', value: nextFollowUp.tanggal },
    { label: 'Jam', value: nextFollowUp.jam },
  ]
  return (
    <Card className="pb-5">
      <CardHead title="Follow-Up Berikutnya" />
      <div className="mt-3 px-5">
        <div className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
          <Clock className="size-4" />
          {nextFollowUp.tanggal} • {nextFollowUp.jam}
        </div>
        <dl className="mt-3 space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-medium text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">Catatan</p>
          <p className="mt-1 text-sm text-foreground">{nextFollowUp.catatan}</p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tandai Selesai
          </button>
          <button
            type="button"
            onClick={onReschedule}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Jadwalkan Ulang
          </button>
        </div>
      </div>
    </Card>
  )
}

/* ---------- Chat preview ---------- */

export function ChatPreview({ onOpen }: { onOpen: () => void }) {
  return (
    <Card className="pb-5">
      <CardHead title="Chat Terbaru" />
      <div className="mt-3 space-y-2.5 px-5">
        {chatPreview.map((c) => (
          <div
            key={c.id}
            className={cn(
              'flex',
              c.dari === 'Umar' ? 'justify-start' : 'justify-end',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                c.dari === 'Umar'
                  ? 'rounded-tl-sm bg-muted text-foreground'
                  : 'rounded-tr-sm bg-primary text-primary-foreground',
              )}
            >
              <p className="mb-0.5 text-[11px] font-semibold opacity-70">
                {c.dari}
              </p>
              {c.pesan}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={onOpen}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <MessageSquare className="size-4" />
          Buka Chat
        </button>
      </div>
    </Card>
  )
}

/* ---------- Insight ---------- */

export function CustomerInsight() {
  return (
    <Card className="border-primary/20 bg-accent/60 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Heart className="size-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Insight Pelanggan
          </h3>
          <div className="mt-2 space-y-1.5">
            {customerInsight.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-foreground/80">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
