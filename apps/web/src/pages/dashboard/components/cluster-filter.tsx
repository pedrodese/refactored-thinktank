import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import type { Labeled } from '@/types/labeled'

interface Props {
  status: string
  options: readonly Labeled<string>[]
}

export function ClusterFilter({ status, options }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-muted-foreground">Mostrar clusters:</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Status dos clusters">
        {options.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={option.value === status ? 'default' : 'outline'}
            aria-pressed={option.value === status}
            onClick={() => router.get('/', { cluster_status: option.value }, { preserveState: true })}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
