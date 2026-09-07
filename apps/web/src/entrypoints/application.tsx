import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted rather than fetched from Google at runtime: an @import of a
// remote stylesheet blocks rendering, cannot be preloaded, and puts a
// third-party request in front of every page load of an internal tool. Only
// the three weights the design system uses, latin subset only - the
// interface is Portuguese, and the full package ships Greek, Cyrillic and
// Vietnamese faces that would sit in the deploy artefact unused.
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
// One weight, for the wordmark and nothing else.
import '@fontsource/outfit/latin-600.css'
import '@/styles/application.css'
import { AuthProvider } from '@/lib/auth-context'
import { AppRoutes } from '@/routes'

// Sem createInertiaApp: não tem mais Rails do outro lado renderizando
// `data-page`. Roteamento client-side (react-router) + sessão JWT
// (AuthProvider) no lugar.
const el = document.getElementById('app')
if (!el) throw new Error('Mount element not found')

createRoot(el).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>,
)
