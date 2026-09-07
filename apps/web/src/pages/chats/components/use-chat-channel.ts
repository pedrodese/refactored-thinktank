import { createConsumer } from '@rails/actioncable'
import { useEffect, useState } from 'react'
import type { ChatMessage } from '@/types/chat-message'

/**
 * The one place in the application that owns data the props did not bring.
 * Inertia is a navigation protocol and has nothing to say about a token
 * arriving every few milliseconds, so the answer comes over a channel instead —
 * as data, keyed by message id, and never as markup to be injected.
 */
type ChannelEvent =
  | { type: 'message'; message: ChatMessage }
  | { type: 'chunk'; messageId: number; content: string }

export function useChatChannel(chatId: number, published: readonly ChatMessage[]): readonly ChatMessage[] {
  const [messages, setMessages] = useState(published)

  useEffect(() => {
    setMessages(published)
  }, [published])

  useEffect(() => {
    const consumer = createConsumer()
    const subscription = consumer.subscriptions.create(
      { channel: 'ChatChannel', chatId },
      { received: (event: ChannelEvent) => setMessages((current) => applyEvent(current, event)) }
    )
    return () => {
      subscription.unsubscribe()
      consumer.disconnect()
    }
  }, [chatId])

  return messages
}

// A chunk lands on a message that already arrived, because the row is created
// before the first token is generated. The completed message arrives last and
// replaces what the chunks accumulated, so a dropped chunk corrects itself.
function applyEvent(messages: readonly ChatMessage[], event: ChannelEvent): readonly ChatMessage[] {
  if (event.type === 'chunk') {
    return messages.map((message) =>
      message.id === event.messageId ? { ...message, content: message.content + event.content } : message
    )
  }
  if (messages.some((message) => message.id === event.message.id)) {
    return messages.map((message) => (message.id === event.message.id ? event.message : message))
  }
  return [...messages, event.message]
}
