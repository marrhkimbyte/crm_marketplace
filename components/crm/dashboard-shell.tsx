'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Sidebar } from '@/components/crm/sidebar'
import { Topbar } from '@/components/crm/topbar'
import { cn } from '@/lib/utils'

const routeMap: Record<string, string> = {
  dashboard: '/',
  pelanggan: '/pelanggan/detail',
  lead: '/lead',
  chat: '/chat',
  produk: '/produk',
  followup: '/follow-up',
  penjualan: '/penjualan',
  laporan: '/laporan',
  pengaturan: '/pengaturan',
}

function getActiveFromPathname(pathname: string) {
  if (pathname === '/') {
    return 'dashboard'
  }

  if (pathname.startsWith('/produk')) {
    return 'produk'
  }

  if (pathname.startsWith('/pelanggan')) {
    return 'pelanggan'
  }

  if (pathname.startsWith('/lead')) {
    return 'lead'
  }

  if (pathname.startsWith('/chat')) {
    return 'chat'
  }

  if (pathname.startsWith('/follow-up')) {
    return 'followup'
  }

  if (pathname.startsWith('/penjualan')) {
    return 'penjualan'
  }

  if (pathname.startsWith('/laporan')) {
    return 'laporan'
  }

  if (pathname.startsWith('/pengaturan')) {
    return 'pengaturan'
  }

  return 'dashboard'
}

export function DashboardShell({
  children,
  activeItem,
}: {
  children: React.ReactNode
  activeItem?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [drawerOpen, setDrawerOpen] = useState(false)

  const active =
    activeItem || getActiveFromPathname(pathname)

  const handleSelect = (id: string) => {
    setDrawerOpen(false)

    const route = routeMap[id]

    if (route) {
      router.push(route)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* DESKTOP SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
        <Sidebar
          active={active}
          onSelect={handleSelect}
        />
      </aside>

      {/* MOBILE DRAWER */}

      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          drawerOpen
            ? 'pointer-events-auto'
            : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-foreground/40 transition-opacity',
            drawerOpen
              ? 'opacity-100'
              : 'opacity-0',
          )}
          onClick={() =>
            setDrawerOpen(false)
          }
          aria-hidden="true"
        />

        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-64 transition-transform duration-300',
            drawerOpen
              ? 'translate-x-0'
              : '-translate-x-full',
          )}
        >
          <button
            type="button"
            onClick={() =>
              setDrawerOpen(false)
            }
            className="absolute right-3 top-4 z-10 flex size-8 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </button>

          <Sidebar
            active={active}
            onSelect={handleSelect}
          />
        </aside>
      </div>

      {/* CONTENT */}

      <div className="lg:pl-60">
        <Topbar
          onMenu={() =>
            setDrawerOpen(true)
          }
        />

        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}