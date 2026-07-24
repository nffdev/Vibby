import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/nav/BottomNav'
import MuxPlayer from '@mux/mux-player-react'
import { ArrowLeft, Loader2, Search, MessageCircle, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import VideoActionMenu from '@/components/video/VideoActionMenu'
import ActionButton from '@/components/video/ActionButton'
import CommentsOverlay from '@/components/video/CommentsOverlay'
import ShareOverlay from '@/components/video/ShareOverlay'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { BASE_API, API_VERSION } from '../../config.json'

export default function VideoWatch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [interaction, setInteraction] = useState(null)
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 })
  const [commentCount, setCommentCount] = useState(0)
  const [showThumb, setShowThumb] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/videos/${id}/resolve`, { headers: { 'Authorization': localStorage.getItem('token') } })
        const j = await r.json()
        if (!r.ok) {
          setError(j.message || 'Impossible to load the video.')
          return
        }

        setVideo(j)
        setCounts({ likes: j.likes || 0, dislikes: j.dislikes || 0 })

        if (j.userId && !j.username) {
          try {
            const rp = await fetch(`${BASE_API}/v${API_VERSION}/profiles/id/${j.userId}`)
            const jp = await rp.json()
            if (rp.ok && jp.username) setVideo(prev => ({ ...prev, username: jp.username }))
          } catch {}
        }

        const token = localStorage.getItem('token')
        if (token) {
          try {
            const [rLikes, rDislikes] = await Promise.all([
              fetch(`${BASE_API}/v${API_VERSION}/likes/me`, { headers: { 'Authorization': token } }),
              fetch(`${BASE_API}/v${API_VERSION}/dislikes/me`, { headers: { 'Authorization': token } })
            ])
            const [jLikes, jDislikes] = await Promise.all([rLikes.json(), rDislikes.json()])
            const liked = rLikes.ok && Array.isArray(jLikes) && jLikes.some(v => v.id === j.id)
            const disliked = rDislikes.ok && Array.isArray(jDislikes) && jDislikes.some(v => v.id === j.id)
            setInteraction(liked ? 'like' : disliked ? 'dislike' : null)
          } catch {}
        }

        try {
          const rc = await fetch(`${BASE_API}/v${API_VERSION}/comments/counts?ids=${encodeURIComponent(j.id)}`)
          const jc = await rc.json()
          if (rc.ok && jc && typeof jc === 'object') setCommentCount(Number(jc[j.id] || 0))
        } catch {}
      } catch {
        setError('Network error while loading the video.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!showThumb) return
    const timer = setTimeout(() => setShowThumb(false), 1000)
    return () => clearTimeout(timer)
  }, [showThumb])

  const manageInteraction = useCallback(async (type) => {
    if (!video) return

    setInteraction((prev) => {
      if (prev === type) {
        setShowThumb(false)
        return null
      }
      setShowThumb(true)
      return type
    })

    setCounts((prev) => {
      if (type === 'like') {
        return {
          likes: prev.likes + (interaction === 'like' ? -1 : 1),
          dislikes: interaction === 'dislike' ? prev.dislikes - 1 : prev.dislikes
        }
      }
      return {
        likes: interaction === 'like' ? prev.likes - 1 : prev.likes,
        dislikes: prev.dislikes + (interaction === 'dislike' ? -1 : 1)
      }
    })

    const endpoint = type === 'like' ? 'likes' : 'dislikes'
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/${endpoint}/${video.id}`, {
        method: 'POST',
        headers: { 'Authorization': localStorage.getItem('token') }
      })
      const j = await r.json()
      if (!r.ok) {
        toast.error(j.message || (type === 'like' ? 'Like failed' : 'Dislike failed'))
        return
      }
      if (type === 'like') {
        setCounts(prev => ({ ...prev, likes: typeof j.likes === 'number' ? j.likes : prev.likes }))
        toast.success(j.liked ? 'Added to liked' : 'Removed from liked')
      } else {
        setCounts(prev => ({ ...prev, dislikes: typeof j.dislikes === 'number' ? j.dislikes : prev.dislikes }))
        toast.success(j.disliked ? 'Added to dislikes' : 'Removed dislike')
      }
    } catch {
      toast.error('Network error')
    }
  }, [interaction, video])

  const isOwner = user?.id && video?.userId && user.id === video.userId
  const shareUrl = `${window.location.origin}/video/${id}`

  return (
    <div className="vibby-landing relative h-screen w-full overflow-hidden bg-[#07070a] text-white antialiased selection:bg-fuchsia-500/30">
      <AnimatePresence>
        {showComments && (
          <motion.div
            key="comments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowComments(false)}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm md:flex md:items-center md:justify-center"
          >
            <div onClick={(e) => e.stopPropagation()} className="contents">
              <CommentsOverlay
                onClose={() => setShowComments(false)}
                videoId={video?.id}
                videoOwnerId={video?.userId}
                onAdded={() => setCommentCount(n => n + 1)}
                onCount={(n) => setCommentCount(n)}
              />
            </div>
          </motion.div>
        )}

        {showShare && (
          <motion.div
            key="share"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShare(false)}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
          >
            <div onClick={(e) => e.stopPropagation()} className="contents">
              <ShareOverlay onClose={() => setShowShare(false)} url={shareUrl} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/70 to-transparent"
      />

      <div className="absolute top-3 sm:top-5 left-3 sm:left-5 z-20">
        <Button
          variant="ghost"
          size={null}
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute top-3 sm:top-5 right-3 sm:right-5 z-20">
        <Button
          variant="ghost"
          size={null}
          aria-label="Rechercher"
          className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex h-[calc(100%-4.5rem)] items-center justify-center md:py-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </div>
        ) : error ? (
          <div className="max-w-sm px-6 text-center">
            <p className="text-2xl font-extrabold tracking-tight">Ça coince.</p>
            <p className="mt-3 text-sm leading-relaxed text-white/45">{error}</p>
          </div>
        ) : video && video.playback_id ? (
          <div className="relative mx-auto h-full w-full overflow-hidden bg-black md:aspect-[9/16] md:h-full md:w-auto md:rounded-3xl md:border md:border-white/10">
            <MuxPlayer
              playbackId={video.playback_id}
              streamType="on-demand"
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              onTimeUpdate={(e) => {
                const { currentTime, duration } = e.target
                setProgress(duration ? (currentTime / duration) * 100 : 0)
              }}
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
            />

            <div className="absolute top-2 right-2 z-10">
              <VideoActionMenu
                videoId={video.id}
                isOwner={isOwner}
                onDeleted={() => navigate(-1)}
                triggerClassName="text-white hover:bg-white/20"
                menuClassName="bg-black/60 backdrop-blur text-white"
              />
            </div>

            <AnimatePresence>
              {showThumb && (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                >
                  {interaction === 'like' ? (
                    <ThumbsUp className="h-28 w-28 fill-fuchsia-500 text-fuchsia-500 drop-shadow-[0_0_35px_rgba(236,72,153,0.55)]" />
                  ) : (
                    <ThumbsDown className="h-28 w-28 fill-red-500 text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.5)]" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute left-3 sm:left-5 bottom-6 sm:bottom-8 z-10 max-w-[70%] text-white">
              {(video.username || video.userId) && (
                <button
                  onClick={() => navigate(video.username ? `/profile?u=${video.username}` : `/profile?id=${video.userId}`)}
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 drop-shadow-md transition-colors hover:text-white sm:text-sm"
                >
                  {video.username ? `@${video.username}` : video.userId}
                </button>
              )}
              {video.title && (
                <div className="text-lg font-semibold leading-tight drop-shadow-md sm:text-xl">{video.title}</div>
              )}
              {video.description && (
                <div className="mt-1 text-sm leading-relaxed text-white/70 drop-shadow-md sm:text-base">{video.description}</div>
              )}
            </div>

            <div className="absolute right-2 sm:right-4 md:right-6 bottom-24 sm:bottom-28 md:bottom-32 z-10 flex flex-col items-center gap-4 sm:gap-5">
              <ActionButton
                icon={ThumbsUp}
                label={counts.likes.toLocaleString()}
                onClick={() => manageInteraction('like')}
                active={interaction === 'like'}
                activeClassName="border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-500"
                fill={interaction === 'like'}
              />

              <ActionButton
                icon={ThumbsDown}
                label={counts.dislikes.toLocaleString()}
                onClick={() => manageInteraction('dislike')}
                active={interaction === 'dislike'}
                activeClassName="border-transparent bg-red-500"
                fill={interaction === 'dislike'}
              />

              <ActionButton
                icon={MessageCircle}
                label={commentCount}
                onClick={() => setShowComments(true)}
              />

              <ActionButton
                icon={Share2}
                label="Partager"
                onClick={() => setShowShare(true)}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-white/15">
              <div
                className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-sm px-6 text-center">
            <p className="text-2xl font-extrabold tracking-tight">Presque là.</p>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              La vidéo est encore en cours de traitement. Reviens dans un instant.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
