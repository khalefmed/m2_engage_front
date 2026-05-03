import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons'
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
  const [copied, setCopied] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  // Fonction pour copier le secret
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Secret copié dans le presse-papier')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const joined = code.join('')
    if (joined.length !== 6) {
      toast.error('Veuillez entrer un code OTP à 6 chiffres.')
      return
    }

    try {
      await onVerify(joined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vérification OTP invalide'
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
            <CardTitle>{mode === 'setup' ? 'Configuration MFA' : 'Vérification OTP'}</CardTitle>
            <CardDescription>
              {mode === 'setup'
                ? 'Congigurez la double authentification en utilisant le secret de secours, puis entrez le code OTP généré.'
                : 'Entrez le code à 6 chiffres depuis votre application d’authentification.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'setup' && (
                <div className="space-y-4 rounded-xl border border-violet-100/80 p-4">
                  {setupData?.qr_code_base64 ? (
                    <div className="flex justify-center bg-white p-2 rounded-lg max-w-[180px] mx-auto shadow-sm">
                        <img src={setupData.qr_code_base64} alt="QR Code MFA" className="h-40 w-40" />
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 text-center">
                      Configurez manuellement avec le secret ci-dessous.
                    </p>
                  )}
                  
                  {setupData?.secret ? (
                    <div className="rounded-lg bg-violet-50/70 p-3 border border-violet-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Secret de secours</p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(setupData.secret)}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-violet-600 hover:text-violet-800 transition-all active:scale-95"
                        >
                          {copied ? (
                            <>
                              <CheckIcon className="w-3.5 h-3.5" />
                              Copié
                            </>
                          ) : (
                            <>
                              <CopyIcon className="w-3.5 h-3.5" />
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                      <p className="break-all font-mono text-sm font-medium tracking-widest text-slate-700">
                        {setupData.secret}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Code de vérification</label>
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
                      className="h-12 text-center text-xl font-bold focus:ring-2 focus:ring-violet-500 transition-all shadow-sm"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      required
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full py-6 text-base font-bold shadow-lg shadow-violet-500/20" disabled={isLoading}>
                {isLoading
                  ? 'Vérification en cours...'
                  : mode === 'setup'
                    ? 'Activer la double authentification'
                    : 'Vérifier et continuer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}