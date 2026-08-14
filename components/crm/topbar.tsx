'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Target,
  ShoppingCart,
  Loader2,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/crm/badges'

type UserData = {
  id: number
  name: string
  email: string
  role: string
  customer_id: number | null
}

type NotificationItem = {
  id: string
  type: 'lead' | 'chat' | 'sale'
  title: string
  description: string
  href: string
}

export function Topbar({
  onMenu,
}: {
  onMenu: () => void
}) {
  const router = useRouter()

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [notifOpen, setNotifOpen] =
    useState(false)

  const [user, setUser] =
    useState<UserData | null>(null)

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([])

  const [loadingUser, setLoadingUser] =
    useState(true)

  const [loggingOut, setLoggingOut] =
    useState(false)

  const loadUser =
    async () => {
      try {
        const response =
          await fetch(
            '/api/auth/me',
            {
              cache: 'no-store',
            },
          )

        if (!response.ok) {
          setUser(null)
          return
        }

        const result =
          await response.json()

        if (
          result.success &&
          result.authenticated
        ) {
          setUser(result.user)
        }
      } catch (error) {
        console.error(
          'TOPBAR USER ERROR:',
          error,
        )
      } finally {
        setLoadingUser(false)
      }
    }

  const loadNotifications =
    async () => {
      /*
       * Dashboard API yang sudah kamu punya
       * menyediakan recentLeads, recentChats,
       * dan data sales.
       *
       * Untuk admin kita gunakan data tersebut
       * sebagai sumber notifikasi.
       */

      try {
        const response =
          await fetch(
            '/api/dashboard',
            {
              cache: 'no-store',
            },
          )

        if (!response.ok) {
          return
        }

        const result =
          await response.json()

        if (!result.success) {
          return
        }

        const data =
          result.data ||
          result

        const items: NotificationItem[] =
          []

        /*
         * LEAD
         */

        if (
          Array.isArray(
            data.recentLeads,
          )
        ) {
          data.recentLeads
            .slice(0, 3)
            .forEach(
              (
                lead: any,
              ) => {
                items.push({
                  id: `lead-${lead.id}`,
                  type: 'lead',
                  title:
                    'Lead baru',
                  description:
                    `${lead.customer_name || 'Pelanggan'} berminat pada ${
                      lead.product_name ||
                      'produk'
                    }`,
                  href: '/lead',
                })
              },
            )
        }

        /*
         * CHAT
         */

        if (
          Array.isArray(
            data.recentChats,
          )
        ) {
          data.recentChats
            .filter(
              (
                chat: any,
              ) =>
                chat.sender ===
                'customer',
            )
            .slice(0, 3)
            .forEach(
              (
                chat: any,
              ) => {
                items.push({
                  id: `chat-${chat.id}`,
                  type: 'chat',
                  title:
                    'Pesan baru',
                  description:
                    `${chat.customer_name || 'Pelanggan'}: ${
                      chat.message ||
                      'Mengirim pesan'
                    }`,
                  href: '/chat',
                })
              },
            )
        }

        /*
         * PENJUALAN
         */

        if (
          Array.isArray(
            data.recentSales,
          )
        ) {
          data.recentSales
            .slice(0, 3)
            .forEach(
              (
                sale: any,
              ) => {
                items.push({
                  id: `sale-${sale.id}`,
                  type: 'sale',
                  title:
                    'Penjualan baru',
                  description:
                    `${sale.customer_name || 'Pelanggan'} membeli ${
                      sale.product_name ||
                      'produk'
                    }`,
                  href: '/penjualan',
                })
              },
            )
        }

        setNotifications(
          items.slice(0, 6),
        )
      } catch (error) {
        console.error(
          'TOPBAR NOTIFICATION ERROR:',
          error,
        )
      }
    }

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (
      user?.role === 'admin'
    ) {
      loadNotifications()

      const interval =
        setInterval(
          loadNotifications,
          30000,
        )

      return () =>
        clearInterval(
          interval,
        )
    }
  }, [user?.role])

  const handleLogout =
    async () => {
      try {
        setLoggingOut(true)

        await fetch(
          '/api/auth/logout',
          {
            method: 'POST',
          },
        )
      } catch (error) {
        console.error(
          'LOGOUT ERROR:',
          error,
        )
      } finally {
        router.replace(
          '/login',
        )

        router.refresh()
      }
    }

  const handleNotification =
    (
      notification: NotificationItem,
    ) => {
      setNotifOpen(false)

      router.push(
        notification.href,
      )
    }

  const notificationCount =
    notifications.length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      <button
        type="button"
        onClick={onMenu}
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="size-5" />
      </button>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative hidden max-w-md flex-1 sm:block">

        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="search"
          placeholder="Cari pelanggan, produk, atau aktivitas..."
          className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/30"
        />

      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">

        {/* MOBILE SEARCH */}

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
          aria-label="Cari"
        >
          <Search className="size-5" />
        </button>

        {/* =================================================
            NOTIFICATION
        ================================================= */}

        {user?.role ===
          'admin' && (
          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setNotifOpen(
                  (value) =>
                    !value,
                )
              }
              className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifikasi"
              aria-expanded={
                notifOpen
              }
            >

              <Bell className="size-5" />

              {notificationCount >
                0 && (
                <span className="absolute right-1 top-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                  {notificationCount >
                  9
                    ? '9+'
                    : notificationCount}
                </span>
              )}

            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() =>
                    setNotifOpen(
                      false,
                    )
                  }
                  aria-hidden="true"
                />

                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">

                  <div className="flex items-center justify-between border-b border-border px-4 py-3">

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Notifikasi
                      </p>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Aktivitas terbaru CRM
                      </p>
                    </div>

                    {notificationCount >
                      0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                        {
                          notificationCount
                        }{' '}
                        baru
                      </span>
                    )}

                  </div>

                  {notifications.length ===
                  0 ? (
                    <div className="p-8 text-center">

                      <Bell className="mx-auto size-7 text-muted-foreground" />

                      <p className="mt-3 text-xs font-medium">
                        Tidak ada notifikasi
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Belum ada aktivitas baru.
                      </p>

                    </div>
                  ) : (
                    <ul className="max-h-80 divide-y divide-border overflow-y-auto">

                      {notifications.map(
                        (
                          notification,
                        ) => (
                          <li
                            key={
                              notification.id
                            }
                          >

                            <button
                              type="button"
                              onClick={() =>
                                handleNotification(
                                  notification,
                                )
                              }
                              className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                            >

                              <NotificationIcon
                                type={
                                  notification.type
                                }
                              />

                              <div className="min-w-0 flex-1">

                                <p className="text-xs font-semibold text-foreground">
                                  {
                                    notification.title
                                  }
                                </p>

                                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                                  {
                                    notification.description
                                  }
                                </p>

                              </div>

                            </button>

                          </li>
                        ),
                      )}

                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(
                        false,
                      )
                      router.push(
                        '/lead',
                      )
                    }}
                    className="w-full border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary transition-colors hover:bg-muted"
                  >
                    Lihat aktivitas
                  </button>

                </div>
              </>
            )}

          </div>
        )}

        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (value) =>
                  !value,
              )
            }
            className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-muted"
            aria-expanded={
              profileOpen
            }
          >

            <Avatar
              name={
                user?.name ||
                'User'
              }
              className="size-8"
            />

            <span className="hidden text-left leading-tight md:block">

              <span className="block max-w-[160px] truncate text-sm font-semibold text-foreground">
                {loadingUser
                  ? 'Memuat...'
                  : user?.name ||
                    'User'}
              </span>

              <span className="block text-[11px] capitalize text-muted-foreground">
                {user?.role ===
                'admin'
                  ? 'Administrator'
                  : 'Customer'}
              </span>

            </span>

            <ChevronDown className="hidden size-4 text-muted-foreground md:block" />

          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() =>
                  setProfileOpen(
                    false,
                  )
                }
                aria-hidden="true"
              />

              <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">

                <div className="px-3 py-3">

                  <div className="flex items-center gap-3">

                    <Avatar
                      name={
                        user?.name ||
                        'User'
                      }
                      className="size-9"
                    />

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-foreground">
                        {user?.name ||
                          'User'}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email ||
                          '-'}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="my-1 h-px bg-border" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(
                      false,
                    )
                    router.push(
                      '/pengaturan',
                    )
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <User className="size-4 text-muted-foreground" />
                  Profil Saya
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(
                      false,
                    )
                    router.push(
                      '/pengaturan',
                    )
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Settings className="size-4 text-muted-foreground" />
                  Pengaturan
                </button>

                <div className="my-1 h-px bg-border" />

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    loggingOut
                  }
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                >

                  {loggingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}

                  {loggingOut
                    ? 'Logout...'
                    : 'Logout'}

                </button>

              </div>
            </>
          )}

        </div>

      </div>
    </header>
  )
}

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({
  type,
}: {
  type: NotificationItem['type']
}) {
  if (type === 'lead') {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <Target className="size-4" />
      </div>
    )
  }

  if (type === 'chat') {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <MessageSquare className="size-4" />
      </div>
    )
  }

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
      <ShoppingCart className="size-4" />
    </div>
  )
}