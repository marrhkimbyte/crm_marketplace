'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { topProducts } from '@/lib/crm-data'
import { Card, CardHead } from '@/components/crm/ui'

const total = topProducts.reduce((sum, p) => sum + p.value, 0)

export function ProductDonut() {
  return (
    <Card className="pb-5">
      <CardHead
        title="Produk Paling Diminati"
        subtitle="Berdasarkan jumlah peminat"
      />
      <div className="mt-2 flex flex-col items-center gap-4 px-5 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topProducts}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                strokeWidth={0}
              >
                {topProducts.map((p) => (
                  <Cell key={p.name} fill={p.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{total}</span>
            <span className="text-[11px] text-muted-foreground">Peminat</span>
          </div>
        </div>

        <ul className="w-full flex-1 space-y-2.5">
          {topProducts.map((p) => (
            <li key={p.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: p.fill }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-foreground">{p.name}</span>
              <span className="font-medium text-foreground">{p.value}</span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {Math.round((p.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
