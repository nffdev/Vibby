import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function LoginPromptDialog({ open, onOpenChange }) {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl">
        <DialogHeader>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <Sparkles className="h-6 w-6 text-fuchsia-400" />
          </span>
          <DialogTitle className="mt-4 text-2xl font-extrabold tracking-tight">
            Rejoins Vibby
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-relaxed text-white/50">
          Connecte-toi pour aimer, commenter et suivre tes créateurs préférés.
          C'est gratuit et ça prend dix secondes.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            size={null}
            onClick={() => navigate('/auth/register')}
            className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.02] active:scale-95"
          >
            Créer un compte
          </Button>
          <Button
            variant="ghost"
            size={null}
            onClick={() => navigate('/auth/login')}
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white hover:bg-white/10 hover:text-white"
          >
            Se connecter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
