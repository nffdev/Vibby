import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from 'sonner'
import { cn, toBase64 } from '@/lib/utils'
import { BASE_API, API_VERSION } from '../../config.json'

export default function EditProfileModal({ profile, onClose, onUpdated }) {
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatar, setAvatar] = useState(profile?.avatar || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await toBase64(file)
      setAvatar(b64)
    } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = { name, bio }
      if (avatar) body.avatar = avatar
      const r = await fetch(`${BASE_API}/v${API_VERSION}/profiles/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
        body: JSON.stringify(body)
      })
      const j = await r.json()
      if (!r.ok) {
        setError(j.message || 'Update failed')
        toast.error(j.message || 'Update failed')
      } else {
        toast.success('Profile updated')
        onUpdated && onUpdated(j)
        onClose()
      }
    } catch {
      setError('Network error')
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const fieldClass = "rounded-2xl border-white/10 bg-white/[0.04] text-sm text-white ring-offset-transparent placeholder:text-white/30 focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="rounded-[2rem] border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight">Modifier le profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-white/10">
              <AvatarImage src={avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-white/10 text-lg font-semibold text-white/70">{(name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <label className="inline-block">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <span className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                Changer la photo
              </span>
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-white/40">Nom</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} minLength={3} maxLength={50} required className={cn("h-12", fieldClass)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-white/40">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} className={cn("resize-none", fieldClass)} />
            <div className="mt-1 text-right text-xs text-white/30">{bio.length}/150</div>
          </div>
          {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" size={null} onClick={onClose} className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10 hover:text-white">
              Annuler
            </Button>
            <Button type="submit" size={null} disabled={saving} className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.03] active:scale-95 disabled:opacity-40">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
