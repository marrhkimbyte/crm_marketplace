'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Package,
  Target,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Bell,
  UserPlus,
  Heart,
  ChevronRight,
} from 'lucide-react'

import { DashboardShell } from '@/components/crm/dashboard-shell'

/* =========================================================
   TYPES
========================================================= */

type DashboardKPI = {
  customers: number
  products: number
  leads: number
  unreadChats: number
  orders: number
  sales: number
  pendingFollowUps: number
}

type LeadStats = {
  total: number
  interested: number
  negotiation: number
  hot: number
  closing: number
  not_interested: number
}

type SalesChartItem = {
  date: string
  total_sales: number
  total_orders: number
}

type PopularProduct = {
  id: number
  name: string
  category: string | null
  price: number
  stock: number
  image: string | null
  interest_count: number
}

type RecentLead = {
  id: number
  status: string
  source: string | null
  created_at: string

  customer_id: number
  customer_name: string
  customer_email: string
  customer_phone: string

  product_id: number
  product_name: string
  product_category: string | null
  product_price: number
  product_image: string | null
}

type RecentFollowUp = {
  id: number
  customer_id: number
  lead_id: number | null
  scheduled_date: string
  scheduled_time: string | null
  priority: string
  status: string
  note: string | null
  customer_name: string
}

type RecentChat = {
  id: number
  customer_id: number
  sender: string
  message: string
  is_read: boolean
  created_at: string
  customer_name: string
  email: string
  phone: string
}

type Activity = {
  type: 'lead' | 'sale' | 'chat'
  id: number
  created_at: string
  customer_name: string
  product_name?: string
  status?: string
  message?: string
  sender?: string
}

type DashboardData = {
  kpi: DashboardKPI
  leadStats: LeadStats
  salesChart: SalesChartItem[]
  popularProducts: PopularProduct[]
  recentLeads: RecentLead[]
  recentFollowUps: RecentFollowUp[]
  recentChats: RecentChat[]
  activities: Activity[]
}

/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultKPI: DashboardKPI = {
  customers: 0,
  products: 0,
  leads: 0,
  unreadChats: 0,
  orders: 0,
  sales: 0,
  pendingFollowUps: 0,
}

const defaultLeadStats: LeadStats = {
  total: 0,
  interested: 0,
  negotiation: 0,
  hot: 0,
  closing: 0,
  not_interested: 0,
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    kpi: defaultKPI,
    leadStats: defaultLeadStats,
    salesChart: [],
    popularProducts: [],
    recentLeads: [],
    recentFollowUps: [],
    recentChats: [],
    activities: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/dashboard', {
        cache: 'no-store',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Gagal mengambil data dashboard.',
        )
      }

      /*
       * PENTING:
       * API dashboard kamu mengirim kpi LANGSUNG,
       * bukan result.data.
       */

      setData({
        kpi: {
          customers: Number(
            result.kpi?.customers || 0,
          ),

          products: Number(
            result.kpi?.products || 0,
          ),

          leads: Number(
            result.kpi?.leads || 0,
          ),

          unreadChats: Number(
            result.kpi?.unreadChats || 0,
          ),

          orders: Number(
            result.kpi?.orders || 0,
          ),

          sales: Number(
            result.kpi?.sales || 0,
          ),

          pendingFollowUps: Number(
            result.kpi?.pendingFollowUps || 0,
          ),
        },

        leadStats: {
          total: Number(
            result.leadStats?.total || 0,
          ),

          interested: Number(
            result.leadStats?.interested || 0,
          ),

          negotiation: Number(
            result.leadStats?.negotiation || 0,
          ),

          hot: Number(
            result.leadStats?.hot || 0,
          ),

          closing: Number(
            result.leadStats?.closing || 0,
          ),

          not_interested: Number(
            result.leadStats?.not_interested || 0,
          ),
        },

        salesChart: Array.isArray(
          result.salesChart,
        )
          ? result.salesChart
          : [],

        popularProducts:
          Array.isArray(
            result.popularProducts,
          )
            ? result.popularProducts
            : [],

        recentLeads:
          Array.isArray(
            result.recentLeads,
          )
            ? result.recentLeads
            : [],

        recentFollowUps:
          Array.isArray(
            result.recentFollowUps,
          )
            ? result.recentFollowUps
            : [],

        recentChats:
          Array.isArray(
            result.recentChats,
          )
            ? result.recentChats
            : [],

        activities:
          Array.isArray(
            result.activities,
          )
            ? result.activities
            : [],
      })
    } catch (err) {
      console.error(
        'DASHBOARD ERROR:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }

  /* =======================================================
     FORMAT
  ======================================================= */

  const formatRupiah = (
    value: number,
  ) => {
    return new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      },
    ).format(value)
  }

  const formatDate = (
    value: string,
  ) => {
    if (!value) {
      return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  }

  const formatShortDate = (
    value: string,
  ) => {
    if (!value) {
      return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
      },
    )
  }

  /* =======================================================
     GRAPH DATA
  ======================================================= */

  const chartData = useMemo(() => {
    const source = [...data.salesChart]

    if (source.length === 0) {
      return []
    }

    return source
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime(),
      )
      .slice(-7)
  }, [data.salesChart])

  const maxChartValue = useMemo(() => {
    if (chartData.length === 0) {
      return 1
    }

    const max = Math.max(
      ...chartData.map(
        (item) =>
          Number(item.total_sales) || 0,
      ),
    )

    return max > 0 ? max : 1
  }, [chartData])

  /*
   * Membuat titik grafik.
   */

  const chartPoints = useMemo(() => {
    if (chartData.length === 0) {
      return ''
    }

    const width = 700
    const height = 220
    const paddingX = 30
    const paddingY = 25

    return chartData
      .map((item, index) => {
        const x =
          chartData.length === 1
            ? width / 2
            : paddingX +
              (index /
                (chartData.length - 1)) *
                (width -
                  paddingX * 2)

        const value =
          Number(
            item.total_sales,
          ) || 0

        const y =
          height -
          paddingY -
          (value /
            maxChartValue) *
            (height -
              paddingY * 2)

        return `${x},${y}`
      })
      .join(' ')
  }, [
    chartData,
    maxChartValue,
  ])

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusClass = (
    status: string,
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case 'selesai':
      case 'closing':
        return 'bg-emerald-50 text-emerald-600'

      case 'tertarik':
      case 'hot lead':
        return 'bg-blue-50 text-blue-600'

      case 'negosiasi':
        return 'bg-amber-50 text-amber-600'

      case 'tidak tertarik':
      case 'dibatalkan':
        return 'bg-red-50 text-red-600'

      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <DashboardShell activeItem="dashboard">
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>CRM</span>
              <span>/</span>
              <span>Dashboard</span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold">
              Dashboard Admin
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Pantau pelanggan, produk, lead,
              penjualan, dan aktivitas CRM.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex w-fit items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-xs font-medium shadow-sm transition hover:bg-muted"
          >
            <TrendingUp className="size-4" />
            Refresh Data
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">

            <AlertCircle className="mt-0.5 size-4 shrink-0" />

            <div>
              <p className="text-xs font-semibold">
                Gagal memuat sebagian data
              </p>

              <p className="mt-1 text-[11px]">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            KPI
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardStat
            label="Total Pelanggan"
            value={
              loading
                ? '...'
                : data.kpi.customers.toLocaleString(
                    'id-ID',
                  )
            }
            description="Pelanggan terdaftar"
            icon={
              <Users className="size-5" />
            }
          />

          <DashboardStat
            label="Total Produk"
            value={
              loading
                ? '...'
                : data.kpi.products.toLocaleString(
                    'id-ID',
                  )
            }
            description="Produk marketplace"
            icon={
              <Package className="size-5" />
            }
          />

          <DashboardStat
            label="Lead / Minat"
            value={
              loading
                ? '...'
                : data.kpi.leads.toLocaleString(
                    'id-ID',
                  )
            }
            description="Minat pelanggan"
            icon={
              <Target className="size-5" />
            }
          />

          <DashboardStat
            label="Total Penjualan"
            value={
              loading
                ? '...'
                : data.kpi.orders.toLocaleString(
                    'id-ID',
                  )
            }
            description="Total transaksi"
            icon={
              <ShoppingCart className="size-5" />
            }
          />

        </div>

        {/* =================================================
            CHART + NOTIFICATION
        ================================================= */}

        <div className="grid gap-4 lg:grid-cols-3">

          {/* SALES GRAPH */}

          <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs text-muted-foreground">
                  Performa Penjualan
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {formatRupiah(
                    data.kpi.sales,
                  )}
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Total penjualan yang tercatat
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="size-5" />
              </div>

            </div>

            {/* LINE CHART */}

            <div className="mt-6">

              {chartData.length === 0 ? (
                <div className="flex h-56 items-center justify-center rounded-xl bg-muted/20">
                  <div className="text-center">
                    <TrendingUp className="mx-auto size-8 text-muted-foreground" />

                    <p className="mt-2 text-xs font-medium">
                      Belum ada data grafik
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Data akan muncul setelah transaksi tercatat.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative h-56 w-full overflow-hidden rounded-xl bg-muted/10">

                    <svg
                      viewBox="0 0 700 220"
                      preserveAspectRatio="none"
                      className="h-full w-full"
                    >
                      {/* GRID */}

                      <line
                        x1="30"
                        y1="25"
                        x2="670"
                        y2="25"
                        stroke="currentColor"
                        strokeOpacity="0.08"
                      />

                      <line
                        x1="30"
                        y1="80"
                        x2="670"
                        y2="80"
                        stroke="currentColor"
                        strokeOpacity="0.08"
                      />

                      <line
                        x1="30"
                        y1="135"
                        x2="670"
                        y2="135"
                        stroke="currentColor"
                        strokeOpacity="0.08"
                      />

                      <line
                        x1="30"
                        y1="195"
                        x2="670"
                        y2="195"
                        stroke="currentColor"
                        strokeOpacity="0.08"
                      />

                      {/* AREA */}

                      <polygon
                        points={`30,195 ${chartPoints} 670,195`}
                        fill="currentColor"
                        fillOpacity="0.06"
                      />

                      {/* LINE */}

                      <polyline
                        points={chartPoints}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      />

                      {/* DOT */}

                      {chartData.map(
                        (
                          item,
                          index,
                        ) => {
                          const width = 700
                          const height = 220
                          const paddingX = 30
                          const paddingY = 25

                          const x =
                            chartData.length === 1
                              ? width / 2
                              : paddingX +
                                (index /
                                  (chartData.length -
                                    1)) *
                                  (width -
                                    paddingX *
                                      2)

                          const value =
                            Number(
                              item.total_sales,
                            ) || 0

                          const y =
                            height -
                            paddingY -
                            (value /
                              maxChartValue) *
                              (height -
                                paddingY *
                                  2)

                          return (
                            <circle
                              key={`${item.date}-${index}`}
                              cx={x}
                              cy={y}
                              r="5"
                              fill="currentColor"
                              className="text-primary"
                            />
                          )
                        },
                      )}
                    </svg>

                  </div>

                  <div className="mt-3 flex justify-between px-2">
                    {chartData.map(
                      (
                        item,
                        index,
                      ) => (
                        <div
                          key={`${item.date}-${index}`}
                          className="text-[9px] text-muted-foreground"
                        >
                          {formatShortDate(
                            item.date,
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}

            </div>

          </div>

          {/* NOTIFICATION */}

          <div className="rounded-2xl border bg-card p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-muted-foreground">
                  Notifikasi CRM
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {data.kpi.unreadChats +
                    data.kpi.leads}
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Aktivitas perlu diperhatikan
                </p>
              </div>

              <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">

                <Bell className="size-5" />

                {data.kpi.unreadChats >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    {data.kpi.unreadChats}
                  </span>
                )}

              </div>

            </div>

            <div className="mt-5 space-y-3">

              {/* CHAT */}

              <a
                href="/chat"
                className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/30"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <MessageSquare className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">
                    Chat belum dibaca
                  </p>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {data.kpi.unreadChats} pesan
                    menunggu balasan
                  </p>
                </div>

                <ChevronRight className="size-4 text-muted-foreground" />
              </a>

              {/* LEAD */}

              <a
                href="/lead"
                className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/30"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Heart className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">
                    Lead / Minat
                  </p>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {data.kpi.leads} lead tercatat
                  </p>
                </div>

                <ChevronRight className="size-4 text-muted-foreground" />
              </a>

              {/* FOLLOW UP */}

              <a
                href="/follow-up"
                className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/30"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">
                    Follow Up
                  </p>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {data.kpi.pendingFollowUps}{' '}
                    follow up pending
                  </p>
                </div>

                <ChevronRight className="size-4 text-muted-foreground" />
              </a>

            </div>

          </div>

        </div>

        {/* =================================================
            LEAD SUMMARY
        ================================================= */}

        <section>

          <div className="mb-4">
            <h2 className="text-sm font-semibold">
              Ringkasan Lead
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Kondisi lead pelanggan saat ini.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <LeadCard
              label="Tertarik"
              value={
                data.leadStats.interested
              }
              className="text-blue-600"
            />

            <LeadCard
              label="Negosiasi"
              value={
                data.leadStats.negotiation
              }
              className="text-amber-600"
            />

            <LeadCard
              label="Hot Lead"
              value={
                data.leadStats.hot
              }
              className="text-red-600"
            />

            <LeadCard
              label="Closing"
              value={
                data.leadStats.closing
              }
              className="text-emerald-600"
            />

            <LeadCard
              label="Tidak Tertarik"
              value={
                data.leadStats.not_interested
              }
              className="text-muted-foreground"
            />

          </div>

        </section>

        {/* =================================================
            PRODUK PALING DIMINATI
        ================================================= */}

        <section className="rounded-2xl border bg-card shadow-sm">

          <div className="flex items-center justify-between border-b p-5">

            <div>
              <h2 className="text-sm font-semibold">
                Produk Paling Diminati
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Produk yang paling banyak menarik minat pelanggan.
              </p>
            </div>

            <a
              href="/produk"
              className="text-xs font-medium text-primary hover:underline"
            >
              Lihat Produk
            </a>

          </div>

          {data.popularProducts.length ===
          0 ? (
            <div className="p-10 text-center">
              <Package className="mx-auto size-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                Belum ada produk
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Produk akan muncul setelah ditambahkan.
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {data.popularProducts.map(
                (
                  product,
                  index,
                ) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 transition hover:bg-muted/20"
                  >

                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs font-semibold">
                        {product.name}
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {product.category ||
                          'Tanpa kategori'}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs font-semibold">
                        {product.interest_count}{' '}
                        minat
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {product.stock} stok
                      </p>

                    </div>

                  </div>
                ),
              )}

            </div>
          )}

        </section>

        {/* =================================================
            GRID RECENT
        ================================================= */}

        <div className="grid gap-4 lg:grid-cols-2">

          {/* RECENT LEADS */}

          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-sm font-semibold">
                  Lead Terbaru
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Minat pelanggan terbaru.
                </p>
              </div>

              <a
                href="/lead"
                className="text-xs font-medium text-primary hover:underline"
              >
                Lihat Semua
              </a>

            </div>

            {data.recentLeads.length ===
            0 ? (
              <div className="p-10 text-center">
                <Target className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  Belum ada lead
                </p>
              </div>
            ) : (
              <div className="divide-y">

                {data.recentLeads.map(
                  (lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-4"
                    >

                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UserPlus className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-xs font-semibold">
                          {lead.customer_name}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-muted-foreground">
                          {lead.product_name}
                        </p>

                      </div>

                      <div className="text-right">

                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[9px] font-medium ${getStatusClass(
                            lead.status,
                          )}`}
                        >
                          {lead.status}
                        </span>

                        <p className="mt-1 text-[9px] text-muted-foreground">
                          {formatDate(
                            lead.created_at,
                          )}
                        </p>

                      </div>

                    </div>
                  ),
                )}

              </div>
            )}

          </section>

          {/* CHAT TERBARU */}

          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-sm font-semibold">
                  Chat Terbaru
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Percakapan pelanggan terbaru.
                </p>
              </div>

              <a
                href="/chat"
                className="text-xs font-medium text-primary hover:underline"
              >
                Buka Chat
              </a>

            </div>

            {data.recentChats.length ===
            0 ? (
              <div className="p-10 text-center">
                <MessageSquare className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  Belum ada chat
                </p>
              </div>
            ) : (
              <div className="divide-y">

                {data.recentChats.map(
                  (chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center gap-3 p-4"
                    >

                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <MessageSquare className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2">

                          <p className="truncate text-xs font-semibold">
                            {chat.customer_name}
                          </p>

                          {!chat.is_read && (
                            <span className="size-2 rounded-full bg-red-500" />
                          )}

                        </div>

                        <p className="mt-1 truncate text-[10px] text-muted-foreground">
                          {chat.message}
                        </p>

                      </div>

                      <p className="shrink-0 text-[9px] text-muted-foreground">
                        {formatDate(
                          chat.created_at,
                        )}
                      </p>

                    </div>
                  ),
                )}

              </div>
            )}

          </section>

        </div>

        {/* =================================================
            FOLLOW UP
        ================================================= */}

        <section className="rounded-2xl border bg-card shadow-sm">

          <div className="flex items-center justify-between border-b p-5">

            <div>
              <h2 className="text-sm font-semibold">
                Follow Up Terbaru
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Follow up yang perlu ditindaklanjuti.
              </p>
            </div>

            <a
              href="/follow-up"
              className="text-xs font-medium text-primary hover:underline"
            >
              Lihat Semua
            </a>

          </div>

          {data.recentFollowUps.length ===
          0 ? (
            <div className="p-10 text-center">
              <Clock className="mx-auto size-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                Tidak ada follow up pending
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {data.recentFollowUps.map(
                (followUp) => (
                  <div
                    key={followUp.id}
                    className="flex flex-col gap-3 p-4 md:flex-row md:items-center"
                  >

                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-xs font-semibold">
                        {followUp.customer_name}
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {followUp.note ||
                          'Tidak ada catatan'}
                      </p>

                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-xs font-medium">
                        {followUp.scheduled_date}
                      </p>

                      {followUp.scheduled_time && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {followUp.scheduled_time}
                        </p>
                      )}

                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-1 text-[9px] font-medium ${getStatusClass(
                        followUp.status,
                      )}`}
                    >
                      {followUp.status}
                    </span>

                  </div>
                ),
              )}

            </div>
          )}

        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section>

          <div className="mb-4">
            <h2 className="text-sm font-semibold">
              Akses Cepat
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Kelola sistem CRM dengan cepat.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <QuickAccess
              title="Pelanggan"
              description="Lihat dan kelola data pelanggan."
              icon={
                <Users className="size-5" />
              }
              href="/pelanggan/detail"
            />

            <QuickAccess
              title="Produk"
              description="Kelola produk marketplace."
              icon={
                <Package className="size-5" />
              }
              href="/produk"
            />

            <QuickAccess
              title="Lead / Minat"
              description="Pantau minat calon pelanggan."
              icon={
                <Target className="size-5" />
              }
              href="/lead"
            />

            <QuickAccess
              title="Penjualan"
              description="Lihat seluruh transaksi."
              icon={
                <ShoppingCart className="size-5" />
              }
              href="/penjualan"
            />

          </div>

        </section>

        {/* =================================================
            SYSTEM SUMMARY
        ================================================= */}

        <div className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border bg-card p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="size-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Sistem CRM Aktif
                </h3>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Dashboard memantau pelanggan,
                  produk, lead, chat,
                  follow up, dan penjualan.
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="size-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Customer Relationship Management
                </h3>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Seluruh data pelanggan dan
                  aktivitas CRM terhubung dengan
                  dashboard.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  )
}

/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
  label,
  value,
  description,
  icon,
}: {
  label: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {value}
          </p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

      </div>

      <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
        <ArrowUpRight className="size-3" />
        {description}
      </div>

    </div>
  )
}

/* =========================================================
   LEAD CARD
========================================================= */

function LeadCard({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${className || ''}`}
      >
        {value.toLocaleString(
          'id-ID',
        )}
      </p>

    </div>
  )
}

/* =========================================================
   QUICK ACCESS
========================================================= */

function QuickAccess({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >

      <div className="flex items-center justify-between">

        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>

        <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />

      </div>

      <h3 className="mt-4 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        {description}
      </p>

    </a>
  )
}