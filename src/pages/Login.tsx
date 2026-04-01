import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

interface LoginProps {
  onSubmit: (username: string, password: string) => Promise<void>
  isLoading?: boolean
}

export function Login({ onSubmit, isLoading = false }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim().length < 3 || password.trim().length < 6) {
      toast.error('Veuillez saisir des identifiants valides.')
      return
    }

    try {
      await onSubmit(username, password)
    } catch (error) {
      console.log(error)
      const message = error instanceof Error ? error.message : 'Connexion impossible'
      toast.error(message)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-80" />
      <div className="relative w-full max-w-md">
        
        <Card className="glass-panel shadow-elegant-lg">
          <CardHeader>
            {/* <div className='flex justify-center align-center items-center'>
              <img src="../logo.png" className='h-12 w-34'  alt="" />
            </div> */}
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous avec votre compte pour acceder a la plateforme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Continuer'}
              </Button>

              {/* <div className="text-xs text-slate-500 dark:text-slate-400">
                API: `POST /auth/login/` puis verification MFA si requise.
              </div> */}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
