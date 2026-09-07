export interface ChatToolCall {
  readonly id: number
  readonly name: string
  readonly arguments: Record<string, unknown>
}
