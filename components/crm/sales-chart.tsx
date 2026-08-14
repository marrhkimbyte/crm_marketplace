'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { salesTrend } from '@/lib/crm-data'
import { Card, CardHead } from '@/components/crm/ui'
import { Dropdown } from '@/components/crm/dropdown'

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-primary">{payload[0].value}</span>{' '}
        transaksi
      </p>
    </div>
  )
}

export function SalesChart() {
  return (
    <Card className="pb-5">
      <CardHead
        title="Grafik Penjualan"
        subtitle="Tren transaksi harian"
        action={
          <Dropdown
            options={['7 Hari Terakhir', '14 Hari Terakhir', '30 Hari Terakhir']}
          />
        }
      />
      <div className="mt-4 h-64 w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={salesTrend}
            margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              width={40}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="penjualan"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              fill="url(#salesFill)"
              dot={{ r: 3, fill: 'var(--color-chart-1)', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-card)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
