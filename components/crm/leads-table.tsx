'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Target } from 'lucide-react'

type Lead = {
  id: number
  customer_id: number
  product_id: number
  status: string
  source: string | null
  created_at: string
  customer_name: string
  product_name: string
  product_category: string | null
  product_price: number | null
  product_image: string | null
}

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true)

        const response = await fetch('/api/dashboard', {
          cache: 'no-store',
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              'Gagal mengambil data lead.',
          )
        }

        setLeads(
          Array.isArray(result.recentLeads)
            ? result.recentLeads
            : [],
        )
      } catch (error) {
        console.error(
          'LOAD DASHBOARD LEADS ERROR:',
          error,
        )

        setLeads([])
      } finally {
        setLoading(false)
      }
    }

    loadLeads()
  }, [])

  const formatTime = (date: string) => {
    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return '-'
    }

    return new Intl.RelativeTimeFormat('id-ID', {
      numeric: 'auto',
    }).format(
      Math.round(
        (parsed.getTime() - Date.now()) /
          60000,
      ),
      'minute',
    )
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Tertarik':
        return 'bg-purple-50 text-purple-600'

      case 'Follow-Up':
      case 'Follow Up':
        return 'bg-emerald-50 text-emerald-600'

      case 'Negosiasi':
        return 'bg-amber-50 text-amber-600'

      case 'Hot Lead':
        return 'bg-orange-50 text-orange-600'

      case 'Closing':
        return 'bg-blue-50 text-blue-600'

      case 'Tidak Tertarik':
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
            Lead / Minat Terbaru
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Prospek baru masuk
          </p>
        </div>

        <Target className="size-5 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="mt-3 text-xs text-muted-foreground">
              Memuat lead...
            </p>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
          <Target className="size-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            Belum ada lead
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Data lead pelanggan akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {leads.slice(0, 5).map((lead) => (
            <div
              key={lead.id}
              className="grid grid-cols-[1fr_1.2fr_auto] items-center gap-4 p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/pelanggan/detail?id=${lead.customer_id}`}
                  className="block truncate text-sm font-semibold hover:text-primary"
                >
                  {lead.customer_name}
                </Link>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatTime(lead.created_at)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">
                  {lead.product_name}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-medium ${getStatusClass(
                  lead.status,
                )}`}
              >
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t p-4">
        <Link
          href="/lead"
          className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
        >
          Lihat Semua
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}