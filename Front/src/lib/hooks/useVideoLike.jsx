import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { BASE_API, API_VERSION } from '../../config.json'

export function useVideoLike(video, { requireAuth, onLikeState } = {}) {
  const [liked, setLiked] = useState(!!video?.liked)
  const [likes, setLikes] = useState(video?.likes || 0)
  const [showThumb, setShowThumb] = useState(false)

  useEffect(() => {
    setLiked(!!video?.liked)
    setLikes(video?.likes || 0)
  }, [video?.id, video?.liked, video?.likes])

  useEffect(() => {
    if (!showThumb) return
    const timer = setTimeout(() => setShowThumb(false), 1000)
    return () => clearTimeout(timer)
  }, [showThumb])

  const toggleLike = useCallback(async () => {
    if (!video) return
    if (requireAuth && !requireAuth()) return

    setLiked((prev) => {
      setShowThumb(!prev)
      setLikes((n) => n + (prev ? -1 : 1))
      return !prev
    })

    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/likes/${video.id}`, {
        method: 'POST',
        headers: { 'Authorization': localStorage.getItem('token') },
      })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || 'Le like a échoué')
        return
      }
      if (typeof j.likes === 'number') setLikes(j.likes)
      toast.success(j.liked ? 'Ajouté aux likes' : 'Retiré des likes')
      onLikeState && onLikeState(!!j.liked)
    } catch {
      toast.error('Erreur réseau')
    }
  }, [video, requireAuth, onLikeState])

  return { liked, likes, showThumb, setShowThumb, toggleLike }
}
