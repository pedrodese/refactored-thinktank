const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const ACCESS_TOKEN_KEY = 'thinktank.accessToken'
const REFRESH_TOKEN_KEY = 'thinktank.refreshToken'

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

// O "lembre-se de mim" da tela de login decide onde a sessão mora, que é o que
// a caixa significava no Devise: marcada, sobrevive a fechar o navegador
// (localStorage); desmarcada, morre com a aba (sessionStorage). Um refresh não
// recebe a escolha, então herda a do login olhando onde o par atual está.
function tokenStore(remember?: boolean): Storage {
  if (remember !== undefined) return remember ? localStorage : sessionStorage
  return localStorage.getItem(REFRESH_TOKEN_KEY) !== null ? localStorage : sessionStorage
}

export function setTokens(tokens: TokenPair, remember?: boolean): void {
  const store = tokenStore(remember)
  clearTokens()
  store.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  store.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearTokens(): void {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(ACCESS_TOKEN_KEY)
    store.removeItem(REFRESH_TOKEN_KEY)
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message)
  }
}

// Chamado quando um 401 sobrevive até a segunda tentativa (refresh falhou ou
// não havia refresh token) — o AuthProvider se registra aqui pra derrubar a
// sessão em memória sem os dois precisarem se importar um ao outro.
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler
}

async function parseErrorBody(response: Response): Promise<{ message: string; errors?: Record<string, string[]> }> {
  try {
    const body = await response.json()
    const message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? response.statusText)
    return { message, errors: body.errors }
  } catch {
    return { message: response.statusText }
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) return false

  setTokens((await response.json()) as TokenPair)
  return true
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

// Um único fetch wrapper pra API inteira: anexa o Bearer token, tenta um
// refresh automático uma vez em cima de 401 e traduz erros do backend
// ({message, errors}) pra ApiError. Sem lib nova — o app inteiro faz um
// punhado de chamadas por tela, não precisa de cache/retry sofisticado.
export async function apiFetch<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const accessToken = getAccessToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401 && !isRetry && path !== '/auth/refresh') {
    if (await refreshAccessToken()) return apiFetch<T>(path, options, true)

    clearTokens()
    onSessionExpired?.()
    const { message } = await parseErrorBody(response)
    throw new ApiError(401, message)
  }

  if (!response.ok) {
    const { message, errors } = await parseErrorBody(response)
    throw new ApiError(response.status, message, errors)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// Sem sessão de cookie (era o que permitia um <a href> puro baixar o CSV no
// Rails) — a API agora só aceita o Bearer token, então o download precisa
// passar pelo fetch com o header e virar Blob antes de "clicar" num <a>
// temporário. Sem retry em cima de 401 (diferente de `apiFetch`): se o token
// tiver expirado bem nesse instante, a pessoa só recarrega a página.
export async function apiDownload(path: string, filename: string): Promise<void> {
  const accessToken = getAccessToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  })
  if (!response.ok) {
    const { message } = await parseErrorBody(response)
    throw new ApiError(response.status, message)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
