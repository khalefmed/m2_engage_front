import { apiRequest, setTokens } from './http'
import type { AuthMe, LoginMfaResponse, MfaSetupResponse, TokenPair } from '../types/api'

interface LoginPayload {
  username: string
  password: string
}

interface VerifyOtpPayload {
  user_id: number
  otp_code: string
}

interface VerifySetupMfaPayload {
  otp_code: string
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<TokenPair | LoginMfaResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if ('access' in response && 'refresh' in response && response.access && response.refresh) {
    setTokens(response.access, response.refresh)
    return { type: 'tokens' as const }
  }

  if (response.mfa_setup_required) {
    if (!response.access) {
      throw new Error('Token temporaire absent pour setup MFA.')
    }
    return {
      type: 'mfa_setup' as const,
      tempAccessToken: response.access,
    }
  }

  if (response.mfa_required && response.user_id) {
    return {
      type: 'mfa_required' as const,
      userId: response.user_id,
    }
  }

  throw new Error('Reponse login inattendue')
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const response = await apiRequest<TokenPair & { role: string }>('/auth/login/verify-otp/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setTokens(response.access, response.refresh)
  return response
}

export async function setupMfa(tempAccessToken: string) {
  const raw = await apiRequest<Record<string, unknown>>('/auth/mfa/setup/', {
    authToken: tempAccessToken,
  })

  return {
    secret: String(raw.secret ?? ''),
    qr_code_base64:
      typeof raw.qr_code_base64 === 'string'
        ? raw.qr_code_base64
        : typeof raw.qr_code === 'string'
          ? raw.qr_code
          : null,
    otp_auth_url: String(raw.otp_auth_url ?? raw.otpauth_url ?? ''),
  } as MfaSetupResponse
}

export async function verifySetupMfa(tempAccessToken: string, payload: VerifySetupMfaPayload) {
  return apiRequest<{ detail?: string }>('/auth/mfa/verify/', {
    method: 'POST',
    authToken: tempAccessToken,
    body: JSON.stringify(payload),
  })
}

export async function getMyProfile() {
  return apiRequest<AuthMe>('/auth/me/', { auth: true })
}


export async function updatePassword(payload: { old_password: string; new_password: string }) {
  return apiRequest<{ detail: string }>('/auth/change-password/', {
    method: 'POST',
    auth: true, 
    body: JSON.stringify(payload),
  })
}
