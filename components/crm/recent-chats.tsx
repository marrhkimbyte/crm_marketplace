'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  MessageSquare,
} from 'lucide-react'

type Chat = {
  id: number
  customer_id: number
  sender: 'customer' | 'admin'
  message: string
  is_read: boolean
  created_at: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
}

export function RecentChats() {
  const [chats, setChats] =
    useState<Chat[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true)

        const response = await fetch(
          '/api/dashboard',
          {
            cache: 'no-store',
          },
        )

        const result =
          await response.json()

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Gagal mengambil data chat.',
          )
        }

        setChats(
          Array.isArray(
            result.recentChats,
          )
            ? result.recentChats
            : [],
        )
      } catch (error) {
        console.error(
          'LOAD DASHBOARD CHAT ERROR:',
          error,
        )

        setChats([])
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [])

  const formatTime = (
    date: string,
  ) => {
    const parsed = new Date(date)

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return '-'
    }

    const diff =
      Math.floor(
        (Date.now() -
          parsed.getTime()) /
          60000,
      )

    if (diff < 1) {
      return 'Baru saja'
    }

    if (diff < 60) {
      return `${diff} menit lalu`
    }

    const hours =
      Math.floor(diff / 60)

    if (hours < 24) {
      return `${hours} jam lalu`
    }

    const days =
      Math.floor(hours / 24)

    return `${days} hari lalu`
  }

  const getInitial = (
    name: string,
  ) => {
    if (!name) return '?'

    return name
      .trim()
      .charAt(0)
      .toUpperCase()
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="text-sm font-semibold">
            Chat Terbaru
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Percakapan pelanggan
          </p>
        </div>

        <MessageSquare className="size-5 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="mt-3 text-xs text-muted-foreground">
              Memuat chat...
            </p>
          </div>
        </div>
      ) : chats.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
          <MessageSquare className="size-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            Belum ada chat
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Percakapan pelanggan akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {chats
            .slice(0, 5)
            .map((chat) => (
              <Link
                key={chat.id}
                href={`/chat?customer_id=${chat.customer_id}`}
                className="flex gap-3 p-4 transition hover:bg-muted/40"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {getInitial(
                    chat.customer_name,
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">
                      {chat.customer_name}
                    </p>

                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatTime(
                        chat.created_at,
                      )}
                    </span>
                  </div>

                  <p
                    className={`mt-1 truncate text-xs ${
                      !chat.is_read &&
                      chat.sender ===
                        'customer'
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {chat.message}
                  </p>
                </div>

                {!chat.is_read &&
                  chat.sender ===
                    'customer' && (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
                  )}
              </Link>
            ))}
        </div>
      )}

      <div className="border-t p-4">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
        >
          Lihat Semua
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}