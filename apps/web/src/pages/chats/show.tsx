import { Link, useForm, usePage } from '@inertiajs/react'
import { PageHeader } from '@/components/page-header'
import { TextAreaField } from '@/components/text-area-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageBubble } from '@/pages/chats/components/message-bubble'
import { useChatChannel } from '@/pages/chats/components/use-chat-channel'
import type { ChatMessage } from '@/types/chat-message'
import type { SharedProps } from '@/types/shared-props'

interface Props {
  chat: { id: number; title: string; modelLabel: string; createdAt: string }
  messages: readonly ChatMessage[]
  chatsPath: string
  submitPath: string
}

export default function ChatsShow({ chat, messages, chatsPath, submitPath }: Props) {
  // The signed-in name is already shared with every page, so it is read rather
  // than sent again with the conversation.
  const currentUserName = usePage<SharedProps>().props.currentUser.name
  const streamed = useChatChannel(chat.id, messages)
  const { data, setData, transform, post, processing, errors, reset } = useForm({ content: '' })
  transform((fields) => ({ message: fields }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={chat.title}
        subtitle={`${chat.modelLabel} · iniciada em ${chat.createdAt}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Conversas', path: chatsPath }
        ]}
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          {streamed.map((message) => (
            <MessageBubble key={message.id} message={message} authorName={currentUserName} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              post(submitPath, { preserveScroll: true, onSuccess: () => reset() })
            }}
          >
            <TextAreaField
              id="message-content"
              label="Mensagem"
              rows={4}
              value={data.content}
              onChange={(value) => setData('content', value)}
              error={errors.content}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={processing}>
                Enviar mensagem
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href={chatsPath}>Voltar às conversas</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
