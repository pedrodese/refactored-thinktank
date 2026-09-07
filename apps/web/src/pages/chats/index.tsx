import { Link, router } from '@inertiajs/react'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ChatRow {
  id: number
  title: string
  modelLabel: string
  createdAt: string
  messagesCount: number
  preview: string
  path: string
}

interface Props {
  chats: readonly ChatRow[]
  newChatPath: string
  modelsPath: string
}

export default function ChatsIndex({ chats, newChatPath, modelsPath }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conversas"
        breadcrumbs={[{ label: 'Dashboard', path: '/' }]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={modelsPath}>Modelos</Link>
            </Button>
            <Button asChild>
              <Link href={newChatPath}>Nova conversa</Link>
            </Button>
          </>
        }
      />

      {chats.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Nenhuma conversa ainda"
              message="Comece uma conversa para testar modelos e acompanhar as respostas."
              action={
                <Button asChild>
                  <Link href={newChatPath}>Iniciar sua primeira conversa</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        chats.map((chat) => <ChatCard key={chat.id} chat={chat} />)
      )}
    </div>
  )
}

function ChatCard({ chat }: { chat: ChatRow }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Link href={chat.path} className="font-medium underline-offset-4 hover:underline">
            {chat.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {chat.createdAt} · {chat.messagesCount} mensagens · {chat.modelLabel}
          </p>
          <p className="text-sm text-muted-foreground">{chat.preview || 'Sem prévia disponível.'}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={chat.path} aria-label={`Abrir ${chat.title}`}>
              Abrir
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm(`Remover a ${chat.title}?`)) router.delete(chat.path)
            }}
          >
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
