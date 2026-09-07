import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Breadcrumb } from '@/types/breadcrumb'

interface Props {
  title: string
  subtitle?: string
  breadcrumbs?: readonly Breadcrumb[]
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs = [], actions }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav aria-label="Trilha" className="mb-2 text-sm">
            <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
              {breadcrumbs.map((crumb) => (
                <li key={crumb.path} className="flex items-center gap-1">
                  <Link to={crumb.path} className="underline-offset-4 hover:underline">
                    {crumb.label}
                  </Link>
                  <span aria-hidden="true">/</span>
                </li>
              ))}
              <li aria-current="page">{title}</li>
            </ol>
          </nav>
        )}
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
