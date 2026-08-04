import { useNavigate } from 'react-router-dom'
import BottomNav from '@/components/nav/BottomNav'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Shield, LogOut, ChevronRight } from 'lucide-react'

function SettingsRow({ icon: Icon, label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-colors hover:bg-white/[0.06]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/60">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white">{label}</span>
        {description && <span className="block text-xs text-white/40">{description}</span>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/25" />
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    window.location.replace('/')
  }

  return (
    <div className="vibby-landing relative min-h-screen w-full bg-[#07070a] pb-28 text-white antialiased selection:bg-fuchsia-500/30">
      <div className="absolute top-3 sm:top-5 left-3 sm:left-5 z-20">
        <Button
          variant="ghost"
          size={null}
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="mx-auto max-w-lg px-5 pt-24">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Réglages</span>
        <h1 className="mt-3 text-[2.5rem] font-extrabold leading-[0.95] tracking-tight">Paramètres</h1>

        <div className="mt-10 space-y-6">
          <div>
            <span className="mb-3 block text-xs uppercase tracking-[0.15em] text-white/35">Compte</span>
            <div className="space-y-2">
              <SettingsRow
                icon={User}
                label="Modifier le profil"
                description="Nom, bio, photo"
                onClick={() => navigate('/profile?edit=1')}
              />
              <SettingsRow
                icon={Shield}
                label="Confidentialité"
                description="Bientôt disponible"
              />
            </div>
          </div>

          <div>
            <span className="mb-3 block text-xs uppercase tracking-[0.15em] text-white/35">Session</span>
            <button
              onClick={logout}
              className="flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-4 text-left transition-colors hover:bg-red-500/[0.12]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                <LogOut className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-red-200">Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
