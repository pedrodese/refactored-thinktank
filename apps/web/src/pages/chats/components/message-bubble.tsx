import type { ChatMessage } from '@/types/chat-message'

interface Props {
  message: ChatMessage
  authorName: string
}

const TONES: Record<ChatMessage['kind'], string> = {
  user: 'bg-accent text-accent-foreground',
  assistant: 'bg-muted text-foreground',
  system: 'bg-status-neutral text-status-neutral-foreground',
  tool: 'bg-status-neutral text-status-neutral-foreground',
  tool_call: 'bg-status-neutral text-status-neutral-foreground'
}

const LABELS: Record<ChatMessage['kind'], string> = {
  user: 'Você',
  assistant: 'Agente',
  system: 'Sistema',
  tool: 'Resultado da ferramenta',
  tool_call: 'Chamada de ferramenta'
}

export function MessageBubble({ message, authorName }: Props) {
  const isFromPerson = message.kind === 'user'

  return (
    <div className={`flex flex-col gap-1 ${isFromPerson ? 'items-end' : 'items-start'}`}>
      <p className="text-xs text-muted-foreground">
        {isFromPerson ? authorName : LABELS[message.kind]} · {message.createdAt}
      </p>
      <div className={`max-w-full rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${TONES[message.kind]}`}>
        {message.kind === 'tool_call' ? <ToolCalls message={message} /> : message.content}
        {message.kind === 'assistant' && message.content === '' && (
          <span role="status" className="text-muted-foreground" data-message-pending>
            Gerando resposta…
          </span>
        )}
      </div>
    </div>
  )
}

function ToolCalls({ message }: { message: ChatMessage }) {
  return (
    <ul className="flex flex-col gap-1">
      {message.toolCalls.map((call) => (
        <li key={call.id} className="font-mono text-xs">
          {call.name}({JSON.stringify(call.arguments)})
        </li>
      ))}
    </ul>
  )
}
