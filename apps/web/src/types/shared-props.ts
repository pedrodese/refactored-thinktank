import type { PageProps } from '@inertiajs/core'
import type { NavigationItem } from '@/types/navigation-item'

/**
 * What every page receives, shared from ApplicationController. Extends
 * Inertia's PageProps because usePage requires the index signature it carries.
 */
export interface SharedProps extends PageProps {
  readonly currentUser: { readonly name: string }
  readonly navigation: {
    readonly primary: readonly NavigationItem[]
    readonly admin: readonly NavigationItem[]
  }
}
