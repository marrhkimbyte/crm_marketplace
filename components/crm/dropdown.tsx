'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type DropdownProps = {
  options: string[]
  value?: string
  onChange?: (value: string) => void
  align?: 'start' | 'end'
  className?: string
  triggerClassName?: string
}

export function Dropdown({
  options,
  value,
  onChange,
  align = 'end',
  className,
  triggerClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value ?? options[0])

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted',
          triggerClassName,
        )}
      >
        {selected}
        <ChevronDown
          className={cn(
            'size-3.5 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            className={cn(
              'absolute z-50 mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg',
              align === 'end' ? 'right-0' : 'left-0',
            )}
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt === selected}
                  onClick={() => {
                    setSelected(opt)
                    onChange?.(opt)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted',
                    opt === selected
                      ? 'font-medium text-primary'
                      : 'text-foreground',
                  )}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
