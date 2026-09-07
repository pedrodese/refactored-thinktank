import { useAuth } from '@/lib/auth-context'

// Provisório: a Dashboard de verdade (pages/dashboard) continua no formato
// antigo do Inertia e será migrada depois — não confundir as duas.
export default function PlaceholderHome() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Bem-vindo, {user?.fullName}</h1>
      <p className="text-sm text-muted-foreground">Nível: {user?.authorizationLevel}</p>
    </div>
  )
}
