import { useState } from 'react'
import ActionMenu from '@/components/ui/ActionMenu'
import CopyButton from '@/components/ui/CopyButton'
import ReportDialog from '@/components/video/ReportDialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BASE_API, API_VERSION } from '../../config.json'

const DEFAULT_TRIGGER = "rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white"
const DEFAULT_MENU = "border border-white/10 bg-[#0b0b10]/95 backdrop-blur-xl text-white"

export default function VideoActionMenu({ videoId, isOwner, onDeleted, triggerClassName, menuClassName }) {
  const [showReport, setShowReport] = useState(false)

  const handleDelete = async (close) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/videos/${videoId}`, { method: 'DELETE', headers: { 'Authorization': localStorage.getItem('token') } })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || 'La suppression a échoué')
      } else {
        toast.success('Vidéo supprimée')
        onDeleted && onDeleted(videoId)
      }
    } catch {
      toast.error('Erreur réseau')
    }
    close()
  }

  return (
    <>
      <ActionMenu
        triggerClassName={cn(DEFAULT_TRIGGER, triggerClassName)}
        menuClassName={cn(DEFAULT_MENU, menuClassName)}
      >
        {({ close }) => (
          <>
            {isOwner && (
              <Button
                variant="ghost"
                size={null}
                className="justify-start rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/15 hover:text-red-200"
                onClick={() => handleDelete(close)}
              >
                Supprimer
              </Button>
            )}
            <CopyButton
              variant="ghost"
              size={null}
              className="justify-start rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 hover:text-white"
              text={`${window.location.origin}/video/${videoId}`}
              onCopied={() => close()}
              successMessage="Lien copié"
            >
              Partager
            </CopyButton>
            {!isOwner && (
              <Button
                variant="ghost"
                size={null}
                className="justify-start rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/15 hover:text-red-200"
                onClick={() => { close(); setShowReport(true) }}
              >
                Signaler
              </Button>
            )}
          </>
        )}
      </ActionMenu>

      <ReportDialog videoId={videoId} open={showReport} onClose={() => setShowReport(false)} />
    </>
  )
}
