import type { LucideIcon } from 'lucide-react'
import {
  Users,
  Target,
  Package,
  ShoppingCart,
  Wallet,
} from 'lucide-react'

export type StatusLead = 'Tertarik' | 'Follow-Up' | 'Negosiasi' | 'Deal'
export type StatusFollowUp =
  | 'Belum Dihubungi'
  | 'Sudah Dihubungi'
  | 'Menunggu Respon'

export type Kpi = {
  id: string
  label: string
  value: string
  hint: string
  positive?: boolean
  icon: LucideIcon
}

export const kpis: Kpi[] = [
  {
    id: 'pelanggan',
    label: 'Total Pelanggan',
    value: '250',
    hint: '+12% dari bulan lalu',
    positive: true,
    icon: Users,
  },
  {
    id: 'lead',
    label: 'Lead / Minat Baru',
    value: '45',
    hint: '+8% dari bulan lalu',
    positive: true,
    icon: Target,
  },
  {
    id: 'produk',
    label: 'Total Produk',
    value: '120',
    hint: '12 produk baru',
    icon: Package,
  },
  {
    id: 'penjualan',
    label: 'Total Penjualan',
    value: '32',
    hint: 'Transaksi bulan ini',
    icon: ShoppingCart,
  },
  {
    id: 'pendapatan',
    label: 'Pendapatan',
    value: 'Rp 12.500.000',
    hint: '+15% dari bulan lalu',
    positive: true,
    icon: Wallet,
  },
]

export const salesTrend = [
  { date: '7 Agu', penjualan: 4, pendapatan: 1800000 },
  { date: '8 Agu', penjualan: 6, pendapatan: 2400000 },
  { date: '9 Agu', penjualan: 3, pendapatan: 1500000 },
  { date: '10 Agu', penjualan: 8, pendapatan: 3200000 },
  { date: '11 Agu', penjualan: 5, pendapatan: 2100000 },
  { date: '12 Agu', penjualan: 9, pendapatan: 3600000 },
  { date: '13 Agu', penjualan: 7, pendapatan: 2900000 },
]

export const topProducts = [
  { name: 'Laptop ASUS', value: 42, fill: 'var(--color-chart-1)' },
  { name: 'Keyboard Mechanical', value: 35, fill: 'var(--color-chart-2)' },
  { name: 'Mouse Wireless', value: 27, fill: 'var(--color-chart-3)' },
  { name: 'Headset Gaming', value: 18, fill: 'var(--color-chart-4)' },
  { name: 'Smartphone', value: 13, fill: 'var(--color-chart-5)' },
]

export type Lead = {
  id: string
  pelanggan: string
  produk: string
  status: StatusLead
  waktu: string
}

export const recentLeads: Lead[] = [
  {
    id: 'l1',
    pelanggan: 'Umar',
    produk: 'Laptop ASUS X',
    status: 'Tertarik',
    waktu: '5 menit lalu',
  },
  {
    id: 'l2',
    pelanggan: 'Budi',
    produk: 'Keyboard Mechanical',
    status: 'Follow-Up',
    waktu: '10 menit lalu',
  },
  {
    id: 'l3',
    pelanggan: 'Citra',
    produk: 'Mouse Wireless',
    status: 'Negosiasi',
    waktu: '20 menit lalu',
  },
  {
    id: 'l4',
    pelanggan: 'Dewi',
    produk: 'Headset Gaming',
    status: 'Tertarik',
    waktu: '30 menit lalu',
  },
]

export type FollowUp = {
  id: string
  pelanggan: string
  produk: string
  jadwal: string
  status: StatusFollowUp
}

export const followUps: FollowUp[] = [
  {
    id: 'f1',
    pelanggan: 'Umar',
    produk: 'Laptop ASUS X',
    jadwal: '13 Agustus',
    status: 'Belum Dihubungi',
  },
  {
    id: 'f2',
    pelanggan: 'Budi',
    produk: 'Keyboard Mechanical',
    jadwal: '13 Agustus',
    status: 'Sudah Dihubungi',
  },
  {
    id: 'f3',
    pelanggan: 'Dewi',
    produk: 'Headset Gaming',
    jadwal: '13 Agustus',
    status: 'Menunggu Respon',
  },
  {
    id: 'f4',
    pelanggan: 'Rian',
    produk: 'Smartphone Xiaomi',
    jadwal: '13 Agustus',
    status: 'Belum Dihubungi',
  },
]

export type Chat = {
  id: string
  nama: string
  pesan: string
  waktu: string
  unread: number
}

export const recentChats: Chat[] = [
  {
    id: 'c1',
    nama: 'Umar',
    pesan: 'Kak, laptop ini masih tersedia?',
    waktu: '2 menit lalu',
    unread: 1,
  },
  {
    id: 'c2',
    nama: 'Budi',
    pesan: 'Bisa nego harga?',
    waktu: '10 menit lalu',
    unread: 2,
  },
  {
    id: 'c3',
    nama: 'Citra',
    pesan: 'Kapan barang dikirim?',
    waktu: '20 menit lalu',
    unread: 1,
  },
  {
    id: 'c4',
    nama: 'Dewi',
    pesan: 'Metode pembayaran apa saja?',
    waktu: '30 menit lalu',
    unread: 1,
  },
]

export type Activity = {
  id: string
  text: string
  highlight: string
  waktu: string
  tone: 'red' | 'green' | 'blue' | 'purple' | 'orange'
}

export type Customer = {
  id: string
  nama: string
  sejak: string
  status: string
  email: string
  telepon: string
  lokasi: string
}

export const customer: Customer = {
  id: 'umar-hakim',
  nama: 'Umar Hakim',
  sejak: 'Pelanggan sejak 12 Juli 2026',
  status: 'Aktif',
  email: 'umar@gmail.com',
  telepon: '081234567890',
  lokasi: 'Tangerang, Indonesia',
}

export const customerKpis: { id: string; label: string; value: string }[] = [
  { id: 'diminati', label: 'Produk Diminati', value: '12' },
  { id: 'pembelian', label: 'Total Pembelian', value: '5' },
  { id: 'pengeluaran', label: 'Total Pengeluaran', value: 'Rp 18.500.000' },
  { id: 'lead', label: 'Lead Aktif', value: '2' },
]

export type InterestedProduct = {
  id: string
  nama: string
  harga: string
  sejak: string
  status: StatusLead
  gambar: string
}

export const interestedProducts: InterestedProduct[] = [
  {
    id: 'p1',
    nama: 'Laptop ASUS X',
    harga: 'Rp 7.000.000',
    sejak: 'Diminati sejak 12 Agustus 2026',
    status: 'Tertarik',
    gambar: '/products/laptop-asus-x.png',
  },
  {
    id: 'p2',
    nama: 'Keyboard Mechanical',
    harga: 'Rp 350.000',
    sejak: 'Diminati sejak 10 Agustus 2026',
    status: 'Follow-Up',
    gambar: '/products/keyboard-mechanical.png',
  },
  {
    id: 'p3',
    nama: 'Mouse Wireless',
    harga: 'Rp 150.000',
    sejak: 'Diminati sejak 8 Agustus 2026',
    status: 'Deal',
    gambar: '/products/mouse-wireless.png',
  },
]

export type InteractionType =
  | 'minat'
  | 'chat'
  | 'followup'
  | 'pembelian'
  | 'lead'

export type Interaction = {
  id: string
  tanggal: string
  jam: string
  type: InteractionType
  text: string
}

export const interactionHistory: Interaction[] = [
  {
    id: 'i1',
    tanggal: '12 Agustus 2026',
    jam: '10:15',
    type: 'minat',
    text: 'Menandai "Laptop ASUS X" sebagai produk diminati',
  },
  {
    id: 'i2',
    tanggal: '12 Agustus 2026',
    jam: '10:30',
    type: 'chat',
    text: 'Mengirim pesan kepada admin',
  },
  {
    id: 'i3',
    tanggal: '12 Agustus 2026',
    jam: '11:00',
    type: 'followup',
    text: 'Admin melakukan follow-up',
  },
  {
    id: 'i4',
    tanggal: '13 Agustus 2026',
    jam: '14:20',
    type: 'chat',
    text: 'Customer membalas pesan',
  },
  {
    id: 'i5',
    tanggal: '14 Agustus 2026',
    jam: '09:15',
    type: 'pembelian',
    text: 'Membeli Laptop ASUS X',
  },
  {
    id: 'i6',
    tanggal: '14 Agustus 2026',
    jam: '09:30',
    type: 'lead',
    text: 'Lead berubah menjadi DEAL',
  },
]

export type Purchase = {
  id: string
  produk: string
  tanggal: string
  total: string
  status: string
}

export const purchaseHistory: Purchase[] = [
  {
    id: 'TRX001',
    produk: 'Laptop ASUS X',
    tanggal: '14 Agustus 2026',
    total: 'Rp 7.000.000',
    status: 'Selesai',
  },
  {
    id: 'TRX008',
    produk: 'Mouse Wireless',
    tanggal: '5 Agustus 2026',
    total: 'Rp 150.000',
    status: 'Selesai',
  },
  {
    id: 'TRX012',
    produk: 'Keyboard Mechanical',
    tanggal: '1 Agustus 2026',
    total: 'Rp 350.000',
    status: 'Selesai',
  },
]

export const customerSummary: { label: string; value: string }[] = [
  { label: 'Status', value: 'Aktif' },
  { label: 'Tipe Pelanggan', value: 'Returning Customer' },
  { label: 'Status Lead', value: 'Follow-Up' },
  { label: 'Total Interaksi', value: '24' },
  { label: 'Aktivitas Terakhir', value: '13 Agustus 2026' },
  { label: 'Pembelian Terakhir', value: '14 Agustus 2026' },
]

export const pipelineStages: { label: string; done: boolean }[] = [
  { label: 'Tertarik', done: true },
  { label: 'Dihubungi', done: true },
  { label: 'Negosiasi', done: true },
  { label: 'Deal', done: false },
]

export const nextFollowUp = {
  pelanggan: 'Umar Hakim',
  produk: 'Laptop ASUS X',
  tanggal: '15 Agustus 2026',
  jam: '10:00',
  catatan:
    'Customer tertarik dengan upgrade RAM dan masih mempertimbangkan pembelian.',
}

export type ChatBubble = {
  id: string
  dari: 'Umar' | 'Admin'
  pesan: string
}

export const chatPreview: ChatBubble[] = [
  { id: 'cb1', dari: 'Umar', pesan: 'Kak, laptop ASUS X masih tersedia?' },
  { id: 'cb2', dari: 'Admin', pesan: 'Masih kak, stok saat ini 15 unit.' },
  { id: 'cb3', dari: 'Umar', pesan: 'Kalau RAM bisa upgrade?' },
]

export const customerInsight = [
  'Umar menunjukkan minat tinggi terhadap produk Laptop dan Aksesoris.',
  'Pelanggan telah melihat 8 produk dan menandai 3 produk sebagai diminati.',
  'Disarankan melakukan follow-up sebelum 15 Agustus 2026.',
]

export const activities: Activity[] = [
  {
    id: 'a1',
    highlight: 'Umar',
    text: 'tertarik dengan Laptop ASUS X',
    waktu: '5 menit yang lalu',
    tone: 'red',
  },
  {
    id: 'a2',
    highlight: 'Budi',
    text: 'membeli Keyboard Mechanical',
    waktu: '15 menit yang lalu',
    tone: 'green',
  },
  {
    id: 'a3',
    highlight: 'Citra',
    text: 'mengirim pesan baru',
    waktu: '20 menit yang lalu',
    tone: 'blue',
  },
  {
    id: 'a4',
    highlight: 'Andi',
    text: 'mendaftar sebagai pelanggan baru',
    waktu: '1 jam yang lalu',
    tone: 'purple',
  },
  {
    id: 'a5',
    highlight: 'Dewi',
    text: 'menyelesaikan pembayaran',
    waktu: '2 jam yang lalu',
    tone: 'orange',
  },
]
