import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wordmark } from '@/components/wordmark'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { canListOperations, canManageOperations } from '@/lib/authorization'
import type { NavigationItem } from '@/types/navigation-item'

interface Props {
  children: ReactNode
}

// Antes a navegação vinha pronta do servidor (page.props.navigation, já
// filtrada por permissão). Sem Inertia, vira uma lista estática no cliente,
// filtrada pelo nível do usuário logado — o servidor continua sendo a única
// autoridade de verdade (um 403 na API é o que realmente bloqueia).
// Clusters/Equipes aparecem pro facilitador também (leitura escopada ao que
// ele facilita, ver `canListOperations`) — diferente do catálogo de
// referência abaixo, que é só pro time interno (`canManageOperations`).
function navigationFor(authorizationLevel: string | undefined): readonly NavigationItem[] {
  const items: NavigationItem[] = []
  if (canListOperations(authorizationLevel)) {
    items.push(
      { label: 'Clusters', path: '/clusters' },
      { label: 'Equipes', path: '/teams' },
      { label: 'Eventos', path: '/events' },
    )
  }
  if (canManageOperations(authorizationLevel)) {
    items.push(
      { label: 'Empresas', path: '/companies' },
      { label: 'Pessoas', path: '/users' },
      { label: 'Capítulos', path: '/chapters' },
      { label: 'Eixos', path: '/axes' },
      { label: 'Fases', path: '/phases' },
      { label: 'Ferramentas', path: '/tools' },
      { label: 'Reuniões', path: '/meetings' },
    )
  }
  return items
}

export default function AppLayout({ children }: Props) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const navigation = navigationFor(user?.authorizationLevel)

  return (
    <div className="min-h-screen bg-background lg:flex lg:items-start">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={isMenuOpen}
          aria-controls="sidebar"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </Button>
        <Wordmark className="text-lg" />
      </div>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <Sidebar navigation={navigation} currentPath={location.pathname} isOpen={isMenuOpen} onLogout={logout} />

      <main className="flex w-full min-w-0 flex-1 flex-col gap-6 px-4 py-6 lg:px-8">{children}</main>
    </div>
  )
}

interface SidebarProps {
  navigation: readonly NavigationItem[]
  currentPath: string
  isOpen: boolean
  onLogout: () => void
}

function Sidebar({ navigation, currentPath, isOpen, onLogout }: SidebarProps) {
  return (
    <aside
      id="sidebar"
      className={`${isOpen ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} w-60 shrink-0 flex-col gap-6 border-r border-border bg-card p-4 lg:sticky lg:top-0 lg:flex lg:h-screen`}
    >
      <Link to="/" className="px-3 py-2" aria-label="Ir para o início">
        <Wordmark />
      </Link>

      <nav aria-label="Principal" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <NavGroup label="Operacional" items={navigation} currentPath={currentPath} />
      </nav>

      <Button variant="outline" className="w-full" onClick={onLogout}>
        Sair
      </Button>
    </aside>
  )
}

interface NavGroupProps {
  label: string
  items: readonly NavigationItem[]
  currentPath: string
}

function NavGroup({ label, items, currentPath }: NavGroupProps) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.path}>
            <NavLink {...item} currentPath={currentPath} />
          </li>
        ))}
      </ul>
    </div>
  )
}

interface NavLinkProps extends NavigationItem {
  currentPath: string
}

function NavLink({ label, path, currentPath }: NavLinkProps) {
  const isCurrent = path === '/' ? currentPath === '/' : currentPath.startsWith(path)

  return (
    <Link
      to={path}
      aria-current={isCurrent ? 'page' : undefined}
      className={`block border-l-2 py-1.5 pl-3 pr-3 text-sm ${
        isCurrent
          ? 'border-primary bg-accent font-medium text-accent-foreground'
          : 'border-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {label}
    </Link>
  )
}
