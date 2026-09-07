import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

/**
 * The native select, carrying the same boundary, height and focus outline as
 * Input. Not from components/ui: shadcn's select is a Radix combobox, which
 * cannot do the multiple selection the association forms need and gives up the
 * platform's own keyboard and mobile behaviour to get there.
 */
export function SelectInput({ className, multiple, ...props }: ComponentProps<'select'>) {
  return (
    <select
      multiple={multiple}
      className={cn(
        'w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'aria-invalid:border-destructive',
        multiple ? 'py-2' : 'h-9 max-sm:h-11',
        className
      )}
      {...props}
    />
  )
}
