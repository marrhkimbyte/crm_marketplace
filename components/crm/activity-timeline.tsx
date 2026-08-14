import { activities, type Activity } from '@/lib/crm-data'
import { Card, CardHead } from '@/components/crm/ui'
import { cn } from '@/lib/utils'

const toneStyles: Record<Activity['tone'], string> = {
  red: 'bg-rose-500',
  green: 'bg-emerald-500',
  blue: 'bg-sky-500',
  purple: 'bg-violet-500',
  orange: 'bg-amber-500',
}

export function ActivityTimeline() {
  return (
    <Card className="pb-6">
      <CardHead
        title="Aktivitas Terbaru"
        subtitle="Riwayat interaksi pelanggan"
      />
      <ol className="mt-4 px-5">
        {activities.map((a, i) => (
          <li key={a.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i !== activities.length - 1 ? (
              <span
                className="absolute left-[5px] top-4 h-full w-px bg-border"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                'relative mt-1 size-2.5 shrink-0 rounded-full ring-4 ring-card',
                toneStyles[a.tone],
              )}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{a.highlight}</span> {a.text}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.waktu}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
