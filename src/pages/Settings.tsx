import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { LockClosedIcon, PersonIcon, EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons'
import { getMyProfile, updatePassword } from '../api/auth' // Assure-toi d'avoir updatePassword dans ton API

export function Settings() {
  // États pour le formulaire de mot de passe
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  // 1. Récupération du profil
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth-me'],
    queryFn: getMyProfile,
  })

  // 2. Mutation pour changer le mot de passe
  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Mot de passe mis à jour avec succès.')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Erreur lors de la mise à jour.'
      toast.error(msg)
    }
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.')
      return
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    passwordMutation.mutate({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* SECTION PROFIL */}
        <Card className="border-none shadow-elegant bg-white dark:bg-white/5 h-fit">
          <CardHeader className="border-b dark:border-white/5">
            <div className="flex items-center gap-3">
              <PersonIcon className="w-5 h-5 text-violet-500" />
              <CardTitle className="text-lg">Mon Profil</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Informations de compte</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {isLoading && <p className="text-center py-4 text-slate-400 animate-pulse">Chargement...</p>}
            {data && (
              <>
                <ProfileItem label="Username" value={data.username} />
                <ProfileItem label="Email" value={data.email} isHighlight />
                <div className="grid grid-cols-2 gap-3">
                  <ProfileItem label="Prénom" value={data.first_name} />
                  <ProfileItem label="Nom" value={data.last_name} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôle</span>
                  <Badge variant="default" className="font-bold">{data.role}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MFA Status</span>
                  <Badge variant={data.is_mfa_enabled ? 'success' : 'warning'} className="font-bold">
                    {data.is_mfa_enabled ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SECTION MOT DE PASSE */}
        <Card className="border-none shadow-elegant bg-white dark:bg-white/5">
          <CardHeader className="border-b dark:border-white/5">
            <div className="flex items-center gap-3">
              <LockClosedIcon className="w-5 h-5 text-violet-500" />
              <CardTitle className="text-lg">Sécurité</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Modifier le mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
                <div className="relative">
                  <Input 
                    type={showPasswords ? "text" : "password"} 
                    className="h-11 rounded-xl bg-slate-50/50 dark:bg-transparent"
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                <Input 
                  type={showPasswords ? "text" : "password"} 
                  className="h-11 rounded-xl bg-slate-50/50 dark:bg-transparent"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  placeholder="Minimum 8 caractères"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                <Input 
                  type={showPasswords ? "text" : "password"} 
                  className="h-11 rounded-xl bg-slate-50/50 dark:bg-transparent"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                  placeholder="Confirmer le nouveau"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs font-bold text-slate-500 hover:text-violet-600 flex items-center gap-2 transition-colors"
                >
                  {showPasswords ? <EyeNoneIcon /> : <EyeOpenIcon />}
                  {showPasswords ? "Masquer" : "Afficher"}
                </button>
                <Button 
                  type="submit" 
                  disabled={passwordMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 px-6 font-bold"
                >
                  {passwordMutation.isPending ? "Mise à jour..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

// Composant interne pour les items de profil
function ProfileItem({ label, value, isHighlight }: { label: string, value?: string, isHighlight?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col gap-0.5">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-bold truncate ${isHighlight ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'}`}>
        {value || '-'}
      </span>
    </div>
  )
}