'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Package,
  Target,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from 'lucide-react'

import { Card } from '@/components/crm/ui'

type DashboardKPI = {
  customers: number
  products: number
  leads: number
  unreadChats: number
  orders: number
  sales: number
  pendingFollowUps: number
}

export function KpiCards() {
  const [kpi, setKpi] = useState<DashboardKPI>({
    customers: 0,
    products: 0,
    leads: 0,
    unreadChats: 0,
    orders: 0,
    sales: 0,
    pendingFollowUps: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)

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

        setKpi({
          customers: Number(result.kpi?.customers || 0),
          products: Number(result.kpi?.products || 0),
          leads: Number(result.kpi?.leads || 0),
          unreadChats: Number(
            result.kpi?.unreadChats || 0,
          ),
          orders: Number(result.kpi?.orders || 0),
          sales: Number(result.kpi?.sales || 0),
          pendingFollowUps: Number(
            result.kpi?.pendingFollowUps || 0,
          ),
        })
      } catch (error) {
        console.error(
          'LOAD DASHBOARD KPI ERROR:',
          error,
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const cards = [
    {
      id: 'customers',
      label: 'Total Pelanggan',
      value: kpi.customers,
      icon: Users,
      description: 'Pelanggan terdaftar',
    },
    {
      id: 'products',
      label: 'Total Produk',
      value: kpi.products,
      icon: Package,
      description: 'Produk tersedia',
    },
    {
      id: 'leads',
      label: 'Lead / Minat',
      value: kpi.leads,
      icon: Target,
      description: 'Prospek pelanggan',
    },
    {
      id: 'chats',
      label: 'Chat Belum Dibaca',
      value: kpi.unreadChats,
      icon: MessageSquare,
      description: 'Pesan dari pelanggan',
    },
    {
      id: 'sales',
      label: 'Total Penjualan',
      value: kpi.sales,
      icon: ShoppingCart,
      description: `${kpi.orders} transaksi`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card
            key={card.id}
            className="p-5"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary">
                <Icon className="size-5" />
              </span>

              {card.id === 'sales' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-status-followup px-2 py-0.5 text-[11px] font-semibold text-status-followup-foreground">
                  <TrendingUp className="size-3" />
                  Penjualan
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {card.label}
            </p>

            <div className="mt-1 flex items-center gap-2">
              {loading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {card.id === 'sales'
                    ? `Rp ${Number(
                        card.value,
                      ).toLocaleString('id-ID')}`
                    : Number(
                        card.value,
                      ).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </Card>
        )
      })}
    </div>
  )
}