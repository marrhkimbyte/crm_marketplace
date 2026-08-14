import { cn } from '@/lib/utils'
import type { StatusFollowUp, StatusLead } from '@/lib/crm-data'

const leadStyles: Record<StatusLead, string> = {
  Tertarik: 'bg-status-tertarik text-status-tertarik-foreground',
  'Follow-Up': 'bg-status-followup text-status-followup-foreground',
  Negosiasi: 'bg-status-negosiasi text-status-negosiasi-foreground',
  Deal: 'bg-status-deal text-status-deal-foreground',
}

export function LeadBadge({ status }: { status: StatusLead }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        leadStyles[status],
      )}
    >
      {status}
    </span>
  )
}

const followUpStyles: Record<StatusFollowUp, string> = {
  'Belum Dihubungi': 'bg-status-negosiasi text-status-negosiasi-foreground',
  'Sudah Dihubungi': 'bg-status-followup text-status-followup-foreground',
  'Menunggu Respon': 'bg-status-deal text-status-deal-foreground',
}

export function FollowUpBadge({ status }: { status: StatusFollowUp }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        followUpStyles[status],
      )}
    >
      {status}
    </span>
  )
}

export function Avatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground',
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
