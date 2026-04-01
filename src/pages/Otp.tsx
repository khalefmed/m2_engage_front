import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import type { MfaSetupResponse } from '../types/api'

interface OtpProps {
  onVerify: (code: string) => Promise<void>
  isLoading?: boolean
  mode?: 'login' | 'setup'
  setupData?: MfaSetupResponse | null
}

export function Otp({ onVerify, isLoading = false, mode = 'login', setupData }: OtpProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const joined = code.join('')
    if (joined.length !== 6) {
      toast.error('Veuillez entrer un code OTP a 6 chiffres.')
      return
    }

    try {
      await onVerify(joined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification OTP invalide'
      toast.error(message)
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = digit
    setCode(next)
    if (digit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-80" />
      <div className="relative w-full max-w-md">
        <Card className="glass-panel shadow-elegant-lg">
          <CardHeader>
            <CardTitle>{mode === 'setup' ? 'Configuration MFA' : 'Verification OTP'}</CardTitle>
            <CardDescription>
              {mode === 'setup'
                ? 'Configurer le secret key puis entrez le code OTP.'
                : 'Entrez le code 6 chiffres depuis Google Authenticator.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'setup' && (
                <div className="space-y-3 rounded-xl border border-violet-100/80 p-4 dark:border-white/10">
                  {setupData?.qr_code_base64 ? (
                    <img src={setupData.qr_code_base64} alt="QR Code MFA" className="mx-auto h-44 w-44 rounded-lg" />
                  ) : (
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Configurez manuellement avec le secret ci-dessous dans l'application Google Authenticator.
                    </p>
                  )}
                  {setupData?.secret ? (
                    <div className="rounded-lg bg-violet-50/70 p-2 dark:bg-white/5">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Secret MFA</p>
                      <p className="mt-1 break-all font-mono text-sm">{setupData.secret}</p>
                    </div>
                  ) : null}
                  {/* {setupData?.otp_auth_url ? (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">OTP Auth URL</p>
                      <p className="mt-1 break-all text-xs text-slate-600 dark:text-slate-300">{setupData.otp_auth_url}</p>
                    </div>
                  ) : null} */}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Code OTP</label>
                <div className="grid grid-cols-6 gap-2">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputsRef.current[index] = el
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="h-12 text-center text-lg"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      required
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? 'Verification...'
                  : mode === 'setup'
                    ? 'Activer MFA'
                    : 'Verifier et continuer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
