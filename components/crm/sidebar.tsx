'use client'

import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Target,
  MessageSquare,
  Package,
  BellRing,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Gem,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  id: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'pelanggan',
    label: 'Pelanggan',
    icon: Users,
  },
  {
    id: 'lead',
    label: 'Lead / Minat',
    icon: Target,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
  },
  {
    id: 'produk',
    label: 'Produk',
    icon: Package,
  },
  {
    id: 'followup',
    label: 'Follow-Up',
    icon: BellRing,
  },
  {
    id: 'penjualan',
    label: 'Penjualan',
    icon: ShoppingCart,
  },
  {
    id: 'laporan',
    label: 'Laporan',
    icon: BarChart3,
  },
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: Settings,
  },
]

type SidebarStats = {
  leads: number
  unreadChats: number
}

export function Sidebar({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  const [stats, setStats] = useState<SidebarStats>({
    leads: 0,
    unreadChats: 0,
  })

  useEffect(() => {
    let mounted = true

    const loadStats = async () => {
      try {
        const response = await fetch(
          '/api/sidebar-stats',
          {
            cache: 'no-store',
          },
        )

        const result = await response.json()

        if (
          mounted &&
          response.ok &&
          result.success
        ) {
          setStats({
            leads: Number(
              result.data?.leads || 0,
            ),
            unreadChats: Number(
              result.data?.unreadChats || 0,
            ),
          })
        }
      } catch (error) {
        console.error(
          'SIDEBAR STATS ERROR:',
          error,
        )
      }
    }

    loadStats()

    const interval = setInterval(
      loadStats,
      10000,
    )

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Gem className="size-5" />
        </span>

        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-sidebar-accent-foreground">
            CRM MARKETPLACE
          </p>

          <p className="text-[11px] text-sidebar-foreground/70">
            Admin Panel
          </p>
        </div>
      </div>

      {/* =====================================================
          MENU
      ===================================================== */}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon

          const isActive =
            active === item.id

          const badge =
            item.id === 'lead'
              ? stats.leads
              : item.id === 'chat'
                ? stats.unreadChats
                : 0

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onSelect(item.id)
              }
              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0" />

              <span className="flex-1 text-left">
                {item.label}
              </span>

              {badge > 0 && (
                <span
                  className={cn(
                    'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    isActive
                      ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                      : 'bg-sidebar-accent text-sidebar-accent-foreground',
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <div className="border-t border-sidebar-border px-3 py-3">
        <button
          type="button"
          onClick={() => {
            console.log('Logout clicked')
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-[18px]" />

          Logout
        </button>
      </div>

    </div>
  )
}