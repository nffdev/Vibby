import ActionMenu from '@/components/ui/ActionMenu'
import CopyButton from '@/components/ui/CopyButton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { BASE_API, API_VERSION } from '../../config.json'

export default function VideoActionMenu({ videoId, isOwner, onDeleted, triggerClassName, menuClassName }) {
  const handleDelete = async (close) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/videos/${videoId}`, { method: 'DELETE', headers: { 'Authorization': localStorage.getItem('token') } })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || 'Delete failed')
      } else {
        toast.success('Video deleted')
        onDeleted && onDeleted(videoId)
      }
    } catch {
      toast.error('Network error')
    }
    close()
  }

  return (
    <ActionMenu triggerClassName={triggerClassName} menuClassName={menuClassName}>
      {({ close }) => (
        <>
          {isOwner && (
            <Button
              variant="ghost"
              className="justify-start text-white hover:bg-white/20"
              onClick={() => handleDelete(close)}
            >
              Delete video
            </Button>
          )}
          <CopyButton
            variant="ghost"
            size="default"
            className="justify-start text-white hover:bg-white/20"
            text={`${window.location.origin}/video/${videoId}`}
            onCopied={() => close()}
            successMessage="Link copied"
          >
            Share
          </CopyButton>
        </>
      )}
    </ActionMenu>
  )
}
