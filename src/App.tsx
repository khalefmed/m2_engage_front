import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { Segments } from './pages/Segments'
import { Campaigns } from './pages/Campaigns'
import { Products } from './pages/Products'
import { Sales } from './pages/Sales'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Otp } from './pages/Otp'
import { Landing } from './pages/Landing'
import { clearTokens, getAccessToken } from './api/http'
import { getMyProfile, login, setupMfa, verifyOtp, verifySetupMfa } from './api/auth'
import type { AuthMe, MfaSetupResponse } from './types/api'

type AuthStep = 'checking' | 'loggedOut' | 'otp' | 'mfaSetup' | 'authed'

function ProtectedLayout({
  authStep,
  onLogout,
  currentUser,
}: {
  authStep: AuthStep
  onLogout: () => void
  currentUser?: AuthMe | null
}) {
  if (authStep === 'authed') {
    return (
      <MainLayout onLogout={onLogout} currentUser={currentUser}>
        <Outlet />
      </MainLayout>
    )
  }

  if (authStep === 'otp' || authStep === 'mfaSetup') {
    return <Navigate to="/otp" replace />
  }

  if (authStep === 'checking') {
    return <div className="min-h-screen bg-mesh" />
  }

  return <Navigate to="/login" replace />
}

function App() {
  const [authStep, setAuthStep] = useState<AuthStep>('checking')
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)
  const [tempAccessToken, setTempAccessToken] = useState<string | null>(null)
  const [mfaSetupData, setMfaSetupData] = useState<MfaSetupResponse | null>(null)
  const [currentUser, setCurrentUser] = useState<AuthMe | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  useEffect(() => {
    async function bootstrapAuth() {
      const token = getAccessToken()
      if (!token) {
        setAuthStep('loggedOut')
        return
      }

      try {
        const profile = await getMyProfile()
        setCurrentUser(profile)
        setAuthStep('authed')
      } catch {
        clearTokens()
        setCurrentUser(null)
        setAuthStep('loggedOut')
      }
    }

    void bootstrapAuth()
  }, [])

  const loginHandlers = useMemo(() => {
    return {
      onLogin: async (username: string, password: string) => {
        setIsAuthLoading(true)
        try {
          const result = await login({ username, password })
          if (result.type === 'tokens') {
            const profile = await getMyProfile()
            setCurrentUser(profile)
            setAuthStep('authed')
            toast.success('Connexion reussie')
            return
          }

          if (result.type === 'mfa_setup') {
            const setupData = await setupMfa(result.tempAccessToken)
            setTempAccessToken(result.tempAccessToken)
            setMfaSetupData(setupData)
            setPendingUserId(null)
            setAuthStep('mfaSetup')
            toast.info('Scannez le QR Code puis validez votre OTP.')
            return
          }

          setPendingUserId(result.userId)
          setAuthStep('otp')
          toast.info('Code OTP requis')
        } finally {
          setIsAuthLoading(false)
        }
      },
      onVerifyOtp: async (code: string) => {
        setIsAuthLoading(true)
        try {
          if (authStep === 'mfaSetup') {
            if (!tempAccessToken) {
              throw new Error('Token temporaire absent. Reconnectez-vous.')
            }
            await verifySetupMfa(tempAccessToken, { otp_code: code })
            setTempAccessToken(null)
            setMfaSetupData(null)
            setAuthStep('loggedOut')
            toast.success('MFA activee. Reconnectez-vous pour finaliser la session.')
            return
          }

          if (!pendingUserId) {
            throw new Error('Session OTP invalide. Reconnectez-vous.')
          }

          await verifyOtp({ user_id: pendingUserId, otp_code: code })
          const profile = await getMyProfile()
          setCurrentUser(profile)
          setPendingUserId(null)
          setAuthStep('authed')
          toast.success('Connexion validee')
        } finally {
          setIsAuthLoading(false)
        }
      },
    }
  }, [authStep, pendingUserId, tempAccessToken])

  const handleLogout = () => {
    clearTokens()
    setPendingUserId(null)
    setTempAccessToken(null)
    setMfaSetupData(null)
    setCurrentUser(null)
    setAuthStep('loggedOut')
    toast.info('Session terminee')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authStep === 'authed' ? (
              <Navigate to="/app/dashboard" replace />
            ) : authStep === 'otp' || authStep === 'mfaSetup' ? (
              <Navigate to="/otp" replace />
            ) : (
              <Login onSubmit={loginHandlers.onLogin} isLoading={isAuthLoading} />
            )
          }
        />
        <Route
          path="/otp"
          element={
            authStep === 'otp' || authStep === 'mfaSetup' ? (
              <Otp
                onVerify={loginHandlers.onVerifyOtp}
                isLoading={isAuthLoading}
                mode={authStep === 'mfaSetup' ? 'setup' : 'login'}
                setupData={mfaSetupData}
              />
            ) : authStep === 'authed' ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/" element={<Landing />} />

        <Route element={<ProtectedLayout authStep={authStep} onLogout={handleLogout} currentUser={currentUser} />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/clients" element={<Clients />} />
          <Route path="/app/segments" element={<Segments />} />
          <Route path="/app/campaigns" element={<Campaigns />} />
          <Route path="/app/products" element={<Products />} />
          <Route path="/app/sales" element={<Sales />} />
          <Route path="/app/analytics" element={<Analytics />} />
          <Route path="/app/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  )
}

export default App
