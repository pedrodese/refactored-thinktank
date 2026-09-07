import type { ReactNode } from 'react'
import { Wordmark } from '@/components/wordmark'

interface Props {
  children: ReactNode
}

// Sem `usePage()`/flash do Inertia (não existe mais um Rails server-side
// gerando flash messages) — cada tela cuida do próprio erro localmente
// agora, como o SessionsNew faz.
export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-background px-4 pt-16 pb-10">
      <Wordmark className="text-3xl" />
      <div className="flex w-full max-w-sm flex-col gap-4">{children}</div>
    </div>
  )
}
