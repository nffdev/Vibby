import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from 'sonner'
import { toBase64 } from '@/lib/utils'
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

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar || "/placeholder.svg"} />
              <AvatarFallback>{(name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <label className="inline-block">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <span className="px-3 py-2 border rounded-md cursor-pointer">Change picture</span>
            </label>
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} minLength={3} maxLength={50} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} />
            <div className="text-right text-xs text-gray-500">{bio.length}/150</div>
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
