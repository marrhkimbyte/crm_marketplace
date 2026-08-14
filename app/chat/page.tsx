'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Send,
  User,
  Users,
  X,
} from 'lucide-react'

import {
  DashboardShell,
} from '@/components/crm/dashboard-shell'

// =====================================================
// TYPES
// =====================================================

type Customer = {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null

  last_message?: string | null
  last_sender?:
    | 'customer'
    | 'admin'
    | null

  last_message_at?: string | null

  unread_count?: number
}

type ChatMessage = {
  id: number
  customer_id: number

  sender:
    | 'customer'
    | 'admin'

  message: string

  is_read: boolean | number

  created_at: string
}

type ChatStats = {
  total_messages: number
  customer_messages: number
  admin_messages: number
  unread_messages: number
}

// =====================================================
// PAGE
// =====================================================

export default function ChatPage() {
  // ===================================================
  // DATA
  // ===================================================

  const [
    customers,
    setCustomers,
  ] = useState<Customer[]>([])

  const [
    allCustomers,
    setAllCustomers,
  ] = useState<Customer[]>([])

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>([])

  const [
    stats,
    setStats,
  ] = useState<ChatStats>({
    total_messages: 0,
    customer_messages: 0,
    admin_messages: 0,
    unread_messages: 0,
  })

  // ===================================================
  // STATE
  // ===================================================

  const [
    selectedCustomerId,
    setSelectedCustomerId,
  ] = useState<number | null>(null)

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    customerSearch,
    setCustomerSearch,
  ] = useState('')

  const [
    messageInput,
    setMessageInput,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    messagesLoading,
    setMessagesLoading,
  ] = useState(false)

  const [
    sending,
    setSending,
  ] = useState(false)

  // ===================================================
  // MODE
  // ===================================================

  const [
    newChatMode,
    setNewChatMode,
  ] = useState(false)

  // ===================================================
  // LOAD CHAT DATA
  // ===================================================

  const loadChats = useCallback(
    async (
      keepSelected = true,
    ) => {
      try {
        setLoading(true)

        const response =
          await fetch(
            '/api/chats',
            {
              method: 'GET',
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

        const data =
          result.data || {}

        setCustomers(
          data.customers || [],
        )

        setAllCustomers(
          data.allCustomers || [],
        )

        setStats({
          total_messages:
            Number(
              data.stats
                ?.total_messages ||
                0,
            ),

          customer_messages:
            Number(
              data.stats
                ?.customer_messages ||
                0,
            ),

          admin_messages:
            Number(
              data.stats
                ?.admin_messages ||
                0,
            ),

          unread_messages:
            Number(
              data.stats
                ?.unread_messages ||
                0,
            ),
        })

        if (!keepSelected) {
          setSelectedCustomerId(
            null,
          )

          return
        }
      } catch (error) {
        console.error(
          'LOAD CHAT ERROR:',
          error,
        )
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // ===================================================
  // LOAD MESSAGES
  // ===================================================

  const loadMessages =
    useCallback(
      async (
        customerId: number,
      ) => {
        try {
          setMessagesLoading(true)

          const response =
            await fetch(
              `/api/chats?customer_id=${customerId}`,
              {
                method: 'GET',
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
                'Gagal mengambil percakapan.',
            )
          }

          setMessages(
            result.data
              ?.messages || [],
          )

          // Update unread setelah dibuka
          await fetch(
            '/api/chats',
            {
              method: 'PUT',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                customer_id:
                  customerId,
              }),
            },
          )
        } catch (error) {
          console.error(
            'LOAD MESSAGES ERROR:',
            error,
          )
        } finally {
          setMessagesLoading(false)
        }
      },
      [],
    )

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadChats(false)
  }, [loadChats])

  // ===================================================
  // LOAD SELECTED CUSTOMER
  // ===================================================

  useEffect(() => {
    if (!selectedCustomerId) {
      setMessages([])

      return
    }

    loadMessages(
      selectedCustomerId,
    )
  }, [
    selectedCustomerId,
    loadMessages,
  ])

  // ===================================================
  // SELECTED CUSTOMER
  // ===================================================

  const selectedCustomer =
    useMemo(() => {
      return allCustomers.find(
        (customer) =>
          customer.id ===
          selectedCustomerId,
      )
    }, [
      allCustomers,
      selectedCustomerId,
    ])

  // ===================================================
  // CHAT LIST SEARCH
  // ===================================================

  const filteredCustomers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase()

      if (!keyword) {
        return customers
      }

      return customers.filter(
        (customer) => {
          return (
            customer.name
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            customer.email
              ?.toLowerCase()
              .includes(
                keyword,
              ) ||
            customer.phone
              ?.toLowerCase()
              .includes(
                keyword,
              )
          )
        },
      )
    }, [
      customers,
      search,
    ])

  // ===================================================
  // NEW CHAT CUSTOMER LIST
  // ===================================================

  const availableCustomers =
    useMemo(() => {
      const keyword =
        customerSearch
          .trim()
          .toLowerCase()

      if (!keyword) {
        return allCustomers
      }

      return allCustomers.filter(
        (customer) => {
          return (
            customer.name
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            customer.email
              ?.toLowerCase()
              .includes(
                keyword,
              ) ||
            customer.phone
              ?.toLowerCase()
              .includes(
                keyword,
              )
          )
        },
      )
    }, [
      allCustomers,
      customerSearch,
    ])

  // ===================================================
  // START NEW CHAT MODE
  // ===================================================

  const openNewChat =
    () => {
      setSelectedCustomerId(
        null,
      )

      setMessages([])

      setCustomerSearch('')

      setNewChatMode(true)
    }

  // ===================================================
  // SELECT CUSTOMER FOR NEW CHAT
  // ===================================================

  const startNewChat = (
    customerId: number,
  ) => {
    setSelectedCustomerId(
      customerId,
    )

    setNewChatMode(false)

    setCustomerSearch('')

    setMessageInput('')
  }

  // ===================================================
  // BACK TO CUSTOMER LIST
  // ===================================================

  const backToChatList =
    () => {
      setSelectedCustomerId(
        null,
      )

      setMessages([])

      setNewChatMode(false)
    }

  // ===================================================
  // SEND MESSAGE
  // ===================================================

  const sendMessage =
    async () => {
      if (
        !selectedCustomerId
      ) {
        return
      }

      const message =
        messageInput.trim()

      if (!message) {
        return
      }

      try {
        setSending(true)

        const response =
          await fetch(
            '/api/chats',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                customer_id:
                  selectedCustomerId,

                sender: 'admin',

                message,
              }),
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
              'Gagal mengirim pesan.',
          )
        }

        setMessageInput('')

        await loadMessages(
          selectedCustomerId,
        )

        await loadChats(true)
      } catch (error) {
        console.error(
          'SEND MESSAGE ERROR:',
          error,
        )

        alert(
          error instanceof Error
            ? error.message
            : 'Gagal mengirim pesan.',
        )
      } finally {
        setSending(false)
      }
    }

  // ===================================================
  // ENTER TO SEND
  // ===================================================

  const handleMessageKeyDown =
    (
      event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
      if (
        event.key === 'Enter' &&
        !event.shiftKey
      ) {
        event.preventDefault()

        sendMessage()
      }
    }

  // ===================================================
  // FORMAT TIME
  // ===================================================

  const formatTime = (
    date?: string | null,
  ) => {
    if (!date) {
      return ''
    }

    const value =
      new Date(date)

    if (
      Number.isNaN(
        value.getTime(),
      )
    ) {
      return ''
    }

    return value.toLocaleTimeString(
      'id-ID',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    )
  }

  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (
    date?: string | null,
  ) => {
    if (!date) {
      return ''
    }

    const value =
      new Date(date)

    if (
      Number.isNaN(
        value.getTime(),
      )
    ) {
      return ''
    }

    return value.toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  }

  // ===================================================
  // INITIALS
  // ===================================================

  const getInitials = (
    name: string,
  ) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word[0],
      )
      .join('')
      .toUpperCase()
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <DashboardShell activeItem="chat">
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>CRM</span>

              <span>/</span>

              <span>Chat</span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Chat Customer
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Kelola percakapan dan komunikasi
              dengan customer.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openNewChat
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="size-4" />

            Mulai Chat
          </button>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <ChatStat
            label="Total Pesan"
            value={
              stats.total_messages
            }
            icon={
              <MessageSquare className="size-4" />
            }
          />

          <ChatStat
            label="Pesan Customer"
            value={
              stats.customer_messages
            }
            icon={
              <User className="size-4" />
            }
          />

          <ChatStat
            label="Pesan Admin"
            value={
              stats.admin_messages
            }
            icon={
              <CheckCheck className="size-4" />
            }
          />

          <ChatStat
            label="Belum Dibaca"
            value={
              stats.unread_messages
            }
            icon={
              <MessageSquare className="size-4" />
            }
            warning={
              stats.unread_messages >
              0
            }
          />
        </div>

        {/* =================================================
            CHAT APPLICATION
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

          <div className="grid h-[650px] grid-cols-1 lg:grid-cols-[320px_1fr]">

            {/* =================================================
                CUSTOMER SELECTOR FOR NEW CHAT
            ================================================= */}

            {newChatMode ? (

              <div className="flex min-w-0 flex-col lg:col-span-2">

                {/* HEADER */}

                <div className="flex items-center gap-3 border-b px-5 py-4">

                  <button
                    type="button"
                    onClick={
                      backToChatList
                    }
                    className="flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                    title="Kembali"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div>
                    <h2 className="text-sm font-semibold">
                      Pilih Pelanggan
                    </h2>

                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Pilih pelanggan yang ingin
                      kamu ajak chat.
                    </p>
                  </div>

                </div>

                {/* SEARCH */}

                <div className="border-b p-4">

                  <div className="relative max-w-md">

                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      value={
                        customerSearch
                      }
                      onChange={(
                        event,
                      ) =>
                        setCustomerSearch(
                          event.target
                            .value,
                        )
                      }
                      autoFocus
                      placeholder="Cari nama pelanggan..."
                      className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none transition focus:border-primary"
                    />

                  </div>

                </div>

                {/* CUSTOMER LIST */}

                <div className="flex-1 overflow-y-auto p-4">

                  {loading ? (

                    <div className="flex h-full items-center justify-center">

                      <div className="flex flex-col items-center gap-2 text-muted-foreground">

                        <Loader2 className="size-5 animate-spin" />

                        <p className="text-xs">
                          Memuat pelanggan...
                        </p>

                      </div>

                    </div>

                  ) : availableCustomers.length ===
                    0 ? (

                    <div className="flex h-full flex-col items-center justify-center text-center">

                      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                        <Users className="size-7" />

                      </div>

                      <p className="mt-4 text-sm font-semibold">
                        Pelanggan tidak ditemukan
                      </p>

                      <p className="mt-1 max-w-xs text-[11px] leading-5 text-muted-foreground">
                        Tidak ada pelanggan yang
                        sesuai dengan pencarian.
                      </p>

                    </div>

                  ) : (

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                      {availableCustomers.map(
                        (
                          customer,
                        ) => (
                          <button
                            key={
                              customer.id
                            }
                            type="button"
                            onClick={() =>
                              startNewChat(
                                customer.id,
                              )
                            }
                            className="flex items-center gap-3 rounded-xl border bg-background p-4 text-left transition hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                          >

                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {getInitials(
                                customer.name,
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-xs font-semibold">
                                {
                                  customer.name
                                }
                              </p>

                              <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                {
                                  customer.email ||
                                  customer.phone ||
                                  'Customer'
                                }
                              </p>

                            </div>

                            <MessageSquare className="size-4 shrink-0 text-muted-foreground" />

                          </button>
                        ),
                      )}

                    </div>
                  )}

                </div>

              </div>

            ) : (

              <>
                {/* =================================================
                    CUSTOMER CHAT LIST
                ================================================= */}

                <aside
                  className={`${
                    selectedCustomerId
                      ? 'hidden lg:flex'
                      : 'flex'
                  } flex-col border-r`}
                >

                  {/* SEARCH */}

                  <div className="border-b p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <div>

                        <h2 className="text-sm font-semibold">
                          Percakapan
                        </h2>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {
                            customers.length
                          }{' '}
                          customer
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          openNewChat
                        }
                        className="flex size-8 items-center justify-center rounded-lg border transition hover:bg-muted"
                        title="Mulai chat baru"
                      >
                        <Plus className="size-4" />
                      </button>

                    </div>

                    <div className="relative">

                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        value={search}
                        onChange={(
                          event,
                        ) =>
                          setSearch(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Cari percakapan..."
                        className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none transition focus:border-primary"
                      />

                    </div>

                  </div>

                  {/* LIST */}

                  <div className="flex-1 overflow-y-auto">

                    {loading ? (

                      <div className="flex h-full items-center justify-center">

                        <div className="flex flex-col items-center gap-2 text-muted-foreground">

                          <Loader2 className="size-5 animate-spin" />

                          <p className="text-xs">
                            Memuat chat...
                          </p>

                        </div>

                      </div>

                    ) : filteredCustomers.length ===
                      0 ? (

                      <EmptyChatList
                        onNewChat={
                          openNewChat
                        }
                      />

                    ) : (

                      filteredCustomers.map(
                        (
                          customer,
                        ) => {

                          const isSelected =
                            customer.id ===
                            selectedCustomerId

                          return (
                            <button
                              key={
                                customer.id
                              }
                              type="button"
                              onClick={() =>
                                setSelectedCustomerId(
                                  customer.id,
                                )
                              }
                              className={`flex w-full items-start gap-3 border-b p-4 text-left transition ${
                                isSelected
                                  ? 'bg-primary/5'
                                  : 'hover:bg-muted/40'
                              }`}
                            >

                              <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-primary/10 text-primary'
                                }`}
                              >
                                {getInitials(
                                  customer.name,
                                )}
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center justify-between gap-2">

                                  <p className="truncate text-xs font-semibold">
                                    {
                                      customer.name
                                    }
                                  </p>

                                  {customer.last_message_at && (
                                    <span className="shrink-0 text-[9px] text-muted-foreground">
                                      {formatTime(
                                        customer.last_message_at,
                                      )}
                                    </span>
                                  )}

                                </div>

                                <div className="mt-1 flex items-center gap-1">

                                  {customer.last_sender ===
                                    'admin' && (
                                    <CheckCheck className="size-3 shrink-0 text-primary" />
                                  )}

                                  <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                                    {
                                      customer.last_message
                                    }
                                  </p>

                                </div>

                                {customer.unread_count &&
                                customer.unread_count >
                                  0 ? (
                                  <div className="mt-2 flex">

                                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                                      {
                                        customer.unread_count
                                      }
                                    </span>

                                  </div>
                                ) : null}

                              </div>

                            </button>
                          )
                        },
                      )
                    )}

                  </div>

                </aside>

                {/* =================================================
                    CHAT WINDOW
                ================================================= */}

                <div
                  className={`${
                    selectedCustomerId
                      ? 'flex'
                      : 'hidden lg:flex'
                  } min-w-0 flex-col`}
                >

                  {selectedCustomer ? (

                    <>
                      {/* CHAT HEADER */}

                      <div className="flex items-center gap-3 border-b px-4 py-3 md:px-5">

                        <button
                          type="button"
                          onClick={
                            backToChatList
                          }
                          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
                        >
                          <X className="size-4" />
                        </button>

                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(
                            selectedCustomer.name,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <h2 className="truncate text-sm font-semibold">
                            {
                              selectedCustomer.name
                            }
                          </h2>

                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                            {
                              selectedCustomer.phone ||
                              selectedCustomer.email ||
                              'Customer'
                            }
                          </p>

                        </div>

                        <div className="flex items-center gap-1">

                          {selectedCustomer.phone && (
                            <a
                              href={`tel:${selectedCustomer.phone}`}
                              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              title="Telepon"
                            >
                              <Phone className="size-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title="Menu"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                        </div>

                      </div>

                      {/* CUSTOMER INFO */}

                      <div className="border-b bg-muted/20 px-4 py-2 md:px-5">

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">

                          <Users className="size-3.5" />

                          <span>
                            {
                              selectedCustomer.email ||
                              'Tidak ada email'
                            }
                          </span>

                          {selectedCustomer.phone && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                {
                                  selectedCustomer.phone
                                }
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                      {/* MESSAGES */}

                      <div className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">

                        {messagesLoading ? (

                          <div className="flex h-full items-center justify-center">

                            <div className="flex flex-col items-center gap-2 text-muted-foreground">

                              <Loader2 className="size-5 animate-spin" />

                              <p className="text-xs">
                                Memuat percakapan...
                              </p>

                            </div>

                          </div>

                        ) : messages.length ===
                          0 ? (

                          <EmptyConversation
                            customerName={
                              selectedCustomer.name
                            }
                          />

                        ) : (

                          <div className="space-y-4">

                            {messages.map(
                              (
                                message,
                                index,
                              ) => {

                                const isAdmin =
                                  message.sender ===
                                  'admin'

                                const previous =
                                  messages[
                                    index - 1
                                  ]

                                const showDate =
                                  !previous ||
                                  formatDate(
                                    previous.created_at,
                                  ) !==
                                    formatDate(
                                      message.created_at,
                                    )

                                return (
                                  <div
                                    key={
                                      message.id
                                    }
                                  >

                                    {showDate && (
                                      <div className="my-4 flex items-center justify-center">

                                        <span className="rounded-full bg-background px-3 py-1 text-[9px] text-muted-foreground shadow-sm">
                                          {formatDate(
                                            message.created_at,
                                          )}
                                        </span>

                                      </div>
                                    )}

                                    <div
                                      className={`flex ${
                                        isAdmin
                                          ? 'justify-end'
                                          : 'justify-start'
                                      }`}
                                    >

                                      <div
                                        className={`max-w-[78%] md:max-w-[65%] ${
                                          isAdmin
                                            ? 'items-end'
                                            : 'items-start'
                                        }`}
                                      >

                                        <div
                                          className={`rounded-2xl px-4 py-2.5 text-sm leading-5 shadow-sm ${
                                            isAdmin
                                              ? 'rounded-br-md bg-primary text-primary-foreground'
                                              : 'rounded-bl-md border bg-background'
                                          }`}
                                        >
                                          {
                                            message.message
                                          }
                                        </div>

                                        <div
                                          className={`mt-1 flex items-center gap-1.5 px-1 ${
                                            isAdmin
                                              ? 'justify-end'
                                              : 'justify-start'
                                          }`}
                                        >

                                          <span className="text-[9px] text-muted-foreground">
                                            {formatTime(
                                              message.created_at,
                                            )}
                                          </span>

                                          {isAdmin &&
                                            (message.is_read ? (
                                              <CheckCheck className="size-3 text-primary" />
                                            ) : (
                                              <Check className="size-3 text-muted-foreground" />
                                            ))}

                                        </div>

                                      </div>

                                    </div>

                                  </div>
                                )
                              },
                            )}

                          </div>
                        )}

                      </div>

                      {/* INPUT */}

                      <div className="border-t bg-background p-3 md:p-4">

                        <div className="flex items-end gap-2">

                          <textarea
                            value={
                              messageInput
                            }
                            onChange={(
                              event,
                            ) =>
                              setMessageInput(
                                event.target
                                  .value,
                              )
                            }
                            onKeyDown={
                              handleMessageKeyDown
                            }
                            disabled={
                              sending
                            }
                            rows={1}
                            placeholder="Tulis pesan..."
                            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border bg-muted/20 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:opacity-60"
                          />

                          <button
                            type="button"
                            disabled={
                              sending ||
                              !messageInput.trim()
                            }
                            onClick={
                              sendMessage
                            }
                            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Kirim pesan"
                          >

                            {sending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Send className="size-4" />
                            )}

                          </button>

                        </div>

                        <p className="mt-1.5 px-1 text-[9px] text-muted-foreground">
                          Tekan Enter untuk mengirim •
                          Shift + Enter untuk baris baru
                        </p>

                      </div>
                    </>

                  ) : (

                    <EmptySelectedChat
                      onNewChat={
                        openNewChat
                      }
                    />

                  )}

                </div>
              </>
            )}

          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

// =====================================================
// STAT CARD
// =====================================================

function ChatStat({
  label,
  value,
  icon,
  warning = false,
}: {
  label: string
  value: number
  icon: React.ReactNode
  warning?: boolean
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <div
          className={
            warning
              ? 'text-amber-500'
              : 'text-muted-foreground'
          }
        >
          {icon}
        </div>

      </div>

      <p
        className={`mt-2 text-2xl font-semibold ${
          warning
            ? 'text-amber-500'
            : ''
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Data dari database
      </p>

    </div>
  )
}

// =====================================================
// EMPTY CHAT LIST
// =====================================================

function EmptyChatList({
  onNewChat,
}: {
  onNewChat: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">

      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MessageSquare className="size-6" />
      </div>

      <p className="mt-4 text-xs font-semibold">
        Belum ada percakapan
      </p>

      <p className="mt-1 max-w-[220px] text-[10px] leading-5 text-muted-foreground">
        Mulai chat dengan customer yang
        sudah terdaftar.
      </p>

      <button
        type="button"
        onClick={onNewChat}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
      >
        <Plus className="size-3.5" />
        Mulai Chat
      </button>

    </div>
  )
}

// =====================================================
// EMPTY CONVERSATION
// =====================================================

function EmptyConversation({
  customerName,
}: {
  customerName: string
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">

      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MessageSquare className="size-7" />
      </div>

      <p className="mt-4 text-sm font-semibold">
        Belum ada pesan
      </p>

      <p className="mt-1 max-w-xs text-[11px] leading-5 text-muted-foreground">
        Belum ada riwayat percakapan dengan{' '}
        {customerName}. Kirim pesan pertama
        untuk memulai percakapan.
      </p>

    </div>
  )
}

// =====================================================
// NO CUSTOMER SELECTED
// =====================================================

function EmptySelectedChat({
  onNewChat,
}: {
  onNewChat: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">

      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MessageSquare className="size-8" />
      </div>

      <h2 className="mt-5 text-sm font-semibold">
        Pilih Percakapan
      </h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
        Pilih customer dari daftar percakapan
        atau mulai chat baru untuk berkomunikasi
        dengan customer.
      </p>

      <button
        type="button"
        onClick={onNewChat}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90"
      >
        <Plus className="size-4" />
        Mulai Chat Baru
      </button>

    </div>
  )
}