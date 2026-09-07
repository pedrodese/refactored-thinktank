/**
 * Lives on Inertia's page object rather than in props, because that is where
 * inertia_rails puts it.
 */
export interface Flash {
  readonly notice?: string
  readonly alert?: string
}
