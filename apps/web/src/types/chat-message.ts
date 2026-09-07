import type { ChatToolCall } from '@/types/chat-tool-call'

/**
 * `kind` is the role, except that an assistant message carrying tool calls is
 * its own thing on screen. The server decides which, so the client never reads
 * `toolCalls` to work out what it is looking at.
 */
export interface ChatMessage {
  readonly id: number
  readonly kind: 'user' | 'assistant' | 'system' | 'tool' | 'tool_call'
  readonly content: string
  readonly createdAt: string
  readonly toolCalls: readonly ChatToolCall[]
}
