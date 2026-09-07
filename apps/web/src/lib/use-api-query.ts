import { useCallback, useEffect, useState } from 'react'
import { apiFetch, ApiError } from './api-client'

interface State<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

// Um hook pequeno pra GET + loading/error, reaproveitado por toda tela de
// lista/detalhe migrada — sem puxar react-query pra isso, o app ainda é
// pequeno demais pra precisar de cache/invalidação sofisticados.
export function useApiQuery<T>(path: string | null): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, error: null, isLoading: path !== null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (path === null) return
    let cancelled = false
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    apiFetch<T>(path)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, isLoading: false })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ data: null, error: error instanceof ApiError ? error.message : 'Erro inesperado', isLoading: false })
        }
      })

    return () => {
      cancelled = true
    }
  }, [path, reloadKey])

  const refetch = useCallback(() => setReloadKey((key) => key + 1), [])
  return { ...state, refetch }
}
