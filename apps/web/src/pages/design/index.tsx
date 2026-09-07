import { useState } from 'react'
import { FormField } from '@/components/form-field'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Wordmark } from '@/components/wordmark'
import { cn } from '@/lib/cn'
import type { AttendanceStatus } from '@/types/attendance-status'
import type { Labeled } from '@/types/labeled'
import { DesignSection } from './components/design-section'

interface Props {
  greeting: string
  chapters: readonly { id: number; title: string; editionYear: number; clustersCount: number }[]
  attendanceStatuses: readonly Labeled<AttendanceStatus>[]
}

const STATUS_TONES = {
  not_registered: 'pending',
  present: 'complete',
  absent: 'destructive',
} as const

const TONE_LEGEND = [
  {
    tone: 'pending',
    label: 'Avaliação pendente',
    meaning: 'algo em aberto, esperando alguém',
    token: '--status-pending',
  },
  {
    tone: 'complete',
    label: 'Avaliado',
    meaning: 'concluído, nada a fazer',
    token: '--status-complete',
  },
  {
    tone: 'neutral',
    label: 'Capítulo anterior',
    meaning: 'informativo, fora do foco',
    token: '--status-neutral',
  },
  {
    tone: 'destructive',
    label: 'Ausente',
    meaning: 'ausência, recusa, exclusão',
    token: '--status-destructive',
  },
  {
    tone: 'emphasis',
    label: 'Capítulo atual',
    meaning: 'o registro corrente',
    token: '--status-emphasis',
  },
] as const

const SURFACES = [
  { name: 'Fundo da página', className: 'bg-background' },
  { name: 'Cartão', className: 'bg-card' },
  { name: 'Sutil', className: 'bg-muted' },
  { name: 'Realce', className: 'bg-accent' },
  { name: 'Ação', className: 'bg-primary' },
  { name: 'Destrutivo', className: 'bg-destructive' },
] as const

const NAV_ITEMS = [
  { label: 'Capítulos', isCurrent: false },
  { label: 'Clusters', isCurrent: true },
  { label: 'Equipes', isCurrent: false },
  { label: 'Eventos', isCurrent: false },
] as const

const TYPE_SCALE = [
  {
    role: 'Título da página',
    sample: 'Clusters de 2026',
    className: 'text-xl font-semibold tracking-tight',
  },
  {
    role: 'Título de seção',
    sample: 'Equipes deste cluster',
    className: 'text-sm font-semibold',
  },
  { role: 'Interface', sample: 'segunda | 19:00 | Ana (2026)', className: 'text-sm' },
  {
    role: 'Secundário',
    sample: '14 membros de equipe, 3 avaliações pendentes',
    className: 'text-xs text-muted-foreground',
  },
  { role: 'Número em tabela', sample: '1.284,50', className: 'text-sm' },
] as const

export default function DesignIndex({ greeting, chapters, attendanceStatuses }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('nao-e-um-email')

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Sistema de design</h1>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <p className="text-xs text-muted-foreground">
            Percorra a página com Tab: todo controle tem anel de foco visível.
          </p>
        </div>
        <Button>Ação principal</Button>
      </header>

      <DesignSection
        title="Superfícies"
        description="Branco sobre um neutro levemente esverdeado. A marca aparece na navegação e nas ações, não pintando áreas grandes."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {SURFACES.map((surface) => (
              <div key={surface.name} className="flex flex-col gap-1.5">
                <div className={cn('size-14 rounded-md border border-input', surface.className)} />
                <span className="text-xs text-muted-foreground">{surface.name}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-2.5">
            <Wordmark className="text-base" />
            <nav aria-label="Exemplo de navegação" className="flex flex-wrap items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  aria-current={item.isCurrent ? 'page' : undefined}
                  className={cn(
                    'border-b-2 px-2 pb-1 text-sm',
                    item.isCurrent
                      ? 'border-primary font-medium text-accent-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <p className="text-xs text-muted-foreground">
            A navegação não é mais um campo verde: o verde aparece na marca do item atual e no
            botão principal, e o resto da tela fica neutro.
          </p>
        </div>
      </DesignSection>

      <DesignSection
        title="Ações"
        description="Uma ação principal por tela. As demais são contorno ou discretas — vários botões preenchidos competem e nenhum ganha."
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Salvar</Button>
            <Button variant="outline">Cancelar</Button>
            <Button variant="ghost">Descartar</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="destructive">Remover</Button>
            <Button variant="secondary">Secundária</Button>
            <Button disabled>Desabilitada</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Compacto</Button>
            <Button>Padrão</Button>
            <Button size="lg">Grande</Button>
          </div>
        </div>
      </DesignSection>

      <DesignSection
        title="Estados do domínio"
        description="Cinco tons cobrem todos os estados. O rótulo carrega o significado; a cor só o reforça."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {attendanceStatuses.map((status) => (
              <StatusBadge key={status.value} tone={STATUS_TONES[status.value]}>
                {status.label}
              </StatusBadge>
            ))}
            <span className="text-xs text-muted-foreground">presença, vinda do servidor</span>
          </div>
          <Table>
            <TableCaption className="sr-only">Tons de estado e seus tokens</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Aparência</TableHead>
                <TableHead>Quando usar</TableHead>
                <TableHead>Token</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TONE_LEGEND.map((entry) => (
                <TableRow key={entry.tone}>
                  <TableCell>
                    <StatusBadge tone={entry.tone}>{entry.label}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{entry.meaning}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {entry.token}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DesignSection>

      <DesignSection
        title="Formulário"
        description="Uma coluna. Rótulo real, dica antes do campo, erro do servidor abaixo dele e associado ao controle."
      >
        <form className="flex max-w-md flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          <FormField
            id="sample-name"
            label="Nome"
            description="Como a pessoa aparece nas listas e nas atas."
            value={name}
            onChange={setName}
            required
          />
          <FormField
            id="sample-email"
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            error="não é um e-mail válido"
          />
          <FormField id="sample-date" label="Data" type="date" value="" onChange={() => {}} />
          <Button type="submit" className="w-full sm:w-auto sm:self-start">
            Salvar
          </Button>
        </form>
      </DesignSection>

      <DesignSection
        title="Tabela"
        description="Linhas compactas, números à direita com figuras tabulares e nenhum zebrado — a régua e o hover bastam para acompanhar a linha."
      >
        <Table>
          <TableCaption className="sr-only">Capítulos e seus clusters</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Capítulo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead className="text-right">Clusters</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chapters.map((chapter) => (
              <TableRow key={chapter.id}>
                <TableCell className="font-medium">{chapter.title}</TableCell>
                <TableCell>{chapter.editionYear}</TableCell>
                <TableCell className="text-right">{chapter.clustersCount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Abrir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DesignSection>

      <DesignSection
        title="Tipografia"
        description="IBM Plex Sans, com a pilha do sistema como reserva. Uma família, quatro papéis, hierarquia por peso e tamanho."
      >
        <dl className="flex flex-col gap-3">
          {TYPE_SCALE.map((entry) => (
            <div
              key={entry.role}
              className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <dt className="w-40 shrink-0 text-xs text-muted-foreground">{entry.role}</dt>
              <dd className={entry.className}>{entry.sample}</dd>
            </div>
          ))}
        </dl>
      </DesignSection>
    </div>
  )
}
