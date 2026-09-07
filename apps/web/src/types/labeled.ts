/**
 * A domain enum value paired with the label the server renders for it. The
 * server owns the translations and the enum definitions, so the value-to-label
 * map is never duplicated here.
 */
export interface Labeled<T extends string> {
  readonly value: T
  readonly label: string
}
