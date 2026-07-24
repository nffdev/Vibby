import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Trash2, Loader2, SendHorizontal, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from "@/lib/hooks/useAuth"
import { BASE_API, API_VERSION } from '../../config.json'

export default function CommentsOverlay({ onClose, videoId, videoOwnerId, onAdded, onCount }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listEndRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      setError('')
      setLoading(true)
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/comments/${videoId}`)
        const j = await r.json()
        if (!r.ok) setError(j.message || 'Unable to load comments')
        else setComments(Array.isArray(j) ? j : [])
      } catch { setError('Network error') }
      finally { setLoading(false) }
    }
    load()
  }, [videoId])

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const send = async () => {
    const token = localStorage.getItem('token')
    if (!token) { toast.error('You must be logged in'); return }
    const payload = text.trim()
    if (!payload || sending) return
    setSending(true)
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/comments/${videoId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: JSON.stringify({ text: payload }) })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || 'Send failed')
      } else {
        setComments(prev => [...prev, j])
        setText('')
        onAdded && onAdded()
        requestAnimationFrame(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }))
      }
    } catch { toast.error('Network error') }
    finally { setSending(false) }
  }

  const removeOne = async (id) => {
    const token = localStorage.getItem('token')
    if (!token) { toast.error('You must be logged in'); return }
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/comments/${id}`, { method: 'DELETE', headers: { 'Authorization': token } })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || 'Delete failed')
      } else {
        setComments(prev => prev.filter(c => c.id !== id))
        const n = comments.length - 1
        onCount && onCount(n >= 0 ? n : 0)
        toast.success('Comment deleted')
      }
    } catch { toast.error('Network error') }
  }

  const canDelete = (comment) =>
    user && comment.userId && (
      String(user.id) === String(comment.userId) ||
      (videoOwnerId && String(user.id) === String(videoOwnerId))
    )

  const profileLink = (c) => c.username ? `/profile?u=${c.username}` : `/profile?id=${c.userId}`

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Commentaires"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 26, stiffness: 280 }}
      className="absolute inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl md:mx-auto md:max-w-lg md:rounded-3xl"
    >
      <div className="shrink-0 px-5 pb-4 pt-3">
        <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
        <div className="flex items-center justify-between">
          <h2 className="flex items-baseline gap-2 text-base font-semibold">
            Commentaires
            {!loading && !error && (
              <span className="font-mono text-xs tabular-nums text-white/35">{comments.length}</span>
            )}
          </h2>
          <Button
            variant="ghost"
            size={null}
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-white/40">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : comments.length ? (
          <>
            {comments.map((c, i) => (
              <div key={c.id || i} className="group flex gap-3">
                <a href={profileLink(c)} className="shrink-0">
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarImage src={c.avatar || '/placeholder.svg'} />
                    <AvatarFallback className="bg-white/10 text-xs font-medium text-white/70">
                      {(c.name || c.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </a>
                <div className="min-w-0 flex-1">
                  <a href={profileLink(c)} className="inline-flex items-baseline gap-2 hover:underline">
                    <span className="text-sm font-medium">{c.name || c.username || 'User'}</span>
                    {c.username && (
                      <span className="text-xs text-white/35">@{c.username}</span>
                    )}
                  </a>
                  <p className="mt-1 break-words text-sm leading-relaxed text-white/70">{c.text}</p>
                </div>
                {canDelete(c) && (
                  <Button
                    variant="ghost"
                    size={null}
                    onClick={() => removeOne(c.id)}
                    aria-label="Supprimer le commentaire"
                    className="h-8 shrink-0 rounded-full p-2 text-white/25 opacity-0 transition hover:bg-red-500/15 hover:text-red-300 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <div ref={listEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <MessageCircle className="h-8 w-8 text-white/15" />
            <p className="text-sm text-white/40">Aucun commentaire. Lance la discussion.</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ajouter un commentaire..."
            aria-label="Ajouter un commentaire"
            className="h-11 flex-1 rounded-full border-white/10 bg-white/[0.06] px-4 text-sm text-white ring-offset-transparent placeholder:text-white/30 focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          />
          <Button
            onClick={send}
            disabled={!text.trim() || sending}
            size={null}
            aria-label="Envoyer"
            className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
