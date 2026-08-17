import { Ban } from 'lucide-react'

export default function Banned() {
  const leave = () => {
    localStorage.removeItem('banned')
    localStorage.removeItem('token')
    window.location.replace('/')
  }

  return (
    <div className="vibby-landing flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-[#07070a] px-6 text-center text-white antialiased">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10">
        <Ban className="h-8 w-8 text-red-400" />
      </span>

      <h1 className="text-[2.5rem] font-extrabold leading-[0.95] tracking-tight">
        Compte{' '}
        <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          suspendu.
        </span>
      </h1>

      <p className="max-w-md text-sm leading-relaxed text-white/50">
        Ton compte a été banni pour non-respect des règles de la communauté.
        L'accès à Vibby est désormais bloqué.
      </p>

      <p className="mt-2 text-xs text-white/30">
        Une erreur ? Contacte le support à{' '}
        <span className="text-white/50">support@vibby.app</span>
      </p>

      <button
        onClick={leave}
        className="mt-6 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
      >
        Quitter
      </button>
    </div>
  )
}
