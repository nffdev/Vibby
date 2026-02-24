import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from "@/lib/hooks/useAuth"
import { BASE_API, API_VERSION } from '../../config.json'

export default function CommentsOverlay({ onClose, videoId, videoOwnerId, onAdded, onCount }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
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

  const send = async () => {
    const token = localStorage.getItem('token')
    if (!token) { toast.error('You must be logged in'); return }
    const payload = text.trim()
    if (!payload) return
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/comments/${videoId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: JSON.stringify({ text: payload }) })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || 'Send failed')
      } else {
        setComments(prev => [...prev, j])
        setText('')
        onAdded && onAdded()
      }
    } catch { toast.error('Network error') }
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

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-xl z-50 max-h-[80vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Comments</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-sm text-gray-500">Loading comments...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : comments.length ? (
          comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={c.avatar || '/placeholder.svg'} />
                <AvatarFallback>{(c.name || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <a href={c.username ? `/profile?u=${c.username}` : `/profile?id=${c.userId}`} className="text-sm font-medium hover:underline">{c.name || c.username || 'User'}</a>
                <a href={c.username ? `/profile?u=${c.username}` : `/profile?id=${c.userId}`} className="block text-xs text-gray-500 dark:text-gray-400 hover:underline">{c.username ? `@${c.username}` : ''}</a>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{c.text}</p>
              </div>
              {canDelete(c) && (
                <Button variant="ghost" size="sm" onClick={() => removeOne(c.id)}>
                  Delete
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">No comment</div>
        )}
      </div>
      <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-900 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Add comment..."
            className="bg-gray-100 dark:bg-gray-800 border-0 flex-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          />
          <Button onClick={send}>Send</Button>
        </div>
      </div>
    </motion.div>
  )
}
