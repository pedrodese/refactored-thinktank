/** One yearly edition of the programme, identified by its year. Capítulo, in the interface. */
export interface Chapter {
  readonly id: string
  readonly title: string
  readonly editionYear: number
  readonly createdAt: string
  readonly updatedAt: string
}
