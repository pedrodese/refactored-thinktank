import { Link, useForm } from '@inertiajs/react'
import { PageHeader } from '@/components/page-header'
import { SelectField } from '@/components/select-field'
import { TextAreaField } from '@/components/text-area-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Labeled } from '@/types/labeled'

interface Props {
  selectedModel: string
  modelOptions: readonly Labeled<string>[]
  defaultModelLabel: string
  submitPath: string
  cancelPath: string
}

export default function ChatsNew({
  selectedModel,
  modelOptions,
  defaultModelLabel,
  submitPath,
  cancelPath
}: Props) {
  const { data, setData, transform, post, processing, errors } = useForm({
    model: selectedModel,
    prompt: ''
  })
  transform((fields) => ({ chat: fields }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova conversa"
        subtitle="Escolha o modelo e escreva a primeira mensagem."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Conversas', path: cancelPath }
        ]}
      />
      <Card>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              post(submitPath)
            }}
          >
            <SelectField
              id="chat-model"
              label="Modelo"
              options={modelOptions}
              blankLabel={defaultModelLabel}
              value={data.model}
              onChange={(value) => setData('model', value)}
              error={errors.model}
            />

            <TextAreaField
              id="chat-prompt"
              label="Prompt"
              rows={6}
              value={data.prompt}
              onChange={(value) => setData('prompt', value)}
              error={errors.prompt}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={processing}>
                Iniciar nova conversa
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href={cancelPath}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
