import { PageHeader } from '@/components/page-header'
import { MeetingForm } from '@/pages/meetings/components/meeting-form'

export default function MeetingsNew() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova reunião"
        subtitle="Preencha os dados principais para continuar."
        breadcrumbs={[
          { label: 'Início', path: '/' },
          { label: 'Reuniões', path: '/meetings' },
        ]}
      />
      <MeetingForm />
    </div>
  )
}
