import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BASE_API, API_VERSION } from '../../config.json'

const REASONS = [
  { value: 'spam', label: 'Spam ou trompeur' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'violence', label: 'Violence' },
  { value: 'other', label: 'Autre' },
]

export default function ReportDialog({ videoId, open, onClose }) {
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!reason || sending) return
    setSending(true)
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/reports/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
        body: JSON.stringify({ reason, detail }),
      })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || 'Le signalement a échoué')
      } else {
        toast.success(j.alreadyReported ? 'Déjà signalée' : 'Signalement envoyé')
        handleClose()
      }
    } catch {
      toast.error('Erreur réseau')
    }
    setSending(false)
  }

  const handleClose = () => {
    setReason('')
    setDetail('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="rounded-[2rem] border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight">Signaler cette vidéo</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={cn(
                'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors',
                reason === r.value
                  ? 'border-fuchsia-400/50 bg-fuchsia-500/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]'
              )}
            >
              {r.label}
              <span className={cn(
                'h-4 w-4 rounded-full border transition-colors',
                reason === r.value ? 'border-fuchsia-400 bg-fuchsia-500' : 'border-white/25'
              )} />
            </button>
          ))}
        </div>

        {reason === 'other' && (
          <Textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Précise le problème (optionnel)"
            maxLength={500}
            className="resize-none rounded-2xl border-white/10 bg-white/[0.04] text-sm text-white ring-offset-transparent placeholder:text-white/30 focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            size={null}
            onClick={handleClose}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10 hover:text-white"
          >
            Annuler
          </Button>
          <Button
            type="button"
            size={null}
            disabled={!reason || sending}
            onClick={submit}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {sending ? 'Envoi...' : 'Signaler'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
