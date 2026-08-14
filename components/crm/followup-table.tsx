'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarClock,
} from 'lucide-react'

type FollowUp = {
  id: number
  customer_id: number
  lead_id: number | null
  scheduled_date: string
  scheduled_time: string | null
  priority: string | null
  status: string
  note: string | null
  customer_name: string
}

export function FollowUpTable() {
  const [followUps, setFollowUps] =
    useState<FollowUp[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const loadFollowUps = async () => {
      try {
        setLoading(true)

        const response = await fetch(
          '/api/dashboard',
          {
            cache: 'no-store',
          },
        )

        const result = await response.json()

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Gagal mengambil data follow-up.',
          )
        }

        setFollowUps(
          Array.isArray(
            result.recentFollowUps,
          )
            ? result.recentFollowUps
            : [],
        )
      } catch (error) {
        console.error(
          'LOAD DASHBOARD FOLLOW UP ERROR:',
          error,
        )

        setFollowUps([])
      } finally {
        setLoading(false)
      }
    }

    loadFollowUps()
  }, [])

  const formatDate = (
    date: string,
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
        day: 'numeric',
        month: 'short',
      },
    ).format(parsed)
  }

  const getStatusClass = (
    status: string,
  ) => {
    switch (status) {
      case 'Sudah Dihubungi':
        return 'bg-emerald-50 text-emerald-600'

      case 'Menunggu Respon':
        return 'bg-blue-50 text-blue-600'

      case 'Belum Dihubungi':
        return 'bg-amber-50 text-amber-600'

      case 'Selesai':
        return 'bg-gray-100 text-gray-500'

      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="text-sm font-semibold">
            Follow-Up Hari Ini
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Jadwal tindak lanjut
          </p>
        </div>

        <CalendarClock className="size-5 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="mt-3 text-xs text-muted-foreground">
              Memuat follow-up...
            </p>
          </div>
        </div>
      ) : followUps.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
          <CalendarClock className="size-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            Belum ada follow-up
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Jadwal follow-up akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {followUps
            .slice(0, 5)
            .map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1.2fr_auto] items-center gap-4 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/pelanggan/detail?id=${item.customer_id}`}
                    className="block truncate text-sm font-semibold hover:text-primary"
                  >
                    {item.customer_name}
                  </Link>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDate(
                      item.scheduled_date,
                    )}

                    {item.scheduled_time
                      ? ` • ${item.scheduled_time}`
                      : ''}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">
                    {item.note ||
                      'Tindak lanjut pelanggan'}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-medium ${getStatusClass(
                    item.status,
                  )}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
        </div>
      )}

      <div className="border-t p-4">
        <Link
          href="/follow-up"
          className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
        >
          Lihat Semua
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}