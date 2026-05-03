// const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')
// const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://m2engageback-production.up.railway.app/api').replace(/\/$/, '')
const ACCESS_TOKEN_KEY = 'marketing_access_token'
const REFRESH_TOKEN_KEY = 'marketing_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

interface ApiRequestOptions extends RequestInit {
  auth?: boolean
  authToken?: string
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = false, authToken, headers, ...rest } = options
  const requestHeaders = new Headers(headers ?? {})

  /**
   * ADAPTATION : Gestion intelligente du Content-Type
   * Si on envoie un fichier (FormData), on ne force pas 'application/json'.
   * Le navigateur doit gérer lui-même le boundary du multipart/form-data.
   */
  if (!(rest.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const token = authToken ?? (auth ? getAccessToken() : null)
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  })

  // Vérification de la présence de contenu avant de tenter le parsing JSON
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    // Gestion d'erreur plus robuste
    const message = (data && (data.detail || data.error || data.message)) || `Erreur API (${response.status})`
    throw new Error(message)
  }

  return data as T
}
