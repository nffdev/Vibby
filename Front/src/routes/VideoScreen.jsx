import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from "@/lib/hooks/useAuth"
import BottomNav from "@/components/nav/BottomNav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle, Share2, ThumbsDown, ThumbsUp, UserPlus, Search } from 'lucide-react'
import VideoActionMenu from '@/components/video/VideoActionMenu'
import CommentsOverlay from '@/components/video/CommentsOverlay'
import ShareOverlay from '@/components/video/ShareOverlay'
import { toast } from 'sonner'
import { cn, resolvePlaybackIds } from "@/lib/utils"
import { BASE_API, API_VERSION } from "../config.json"
import MuxPlayer from '@mux/mux-player-react'

function ActionButton({ icon: Icon, label, onClick, active, activeClassName, fill }) {
  return (
    <Button
      variant="ghost"
      size={null}
      onClick={onClick}
      className="group flex h-auto flex-col items-center gap-1.5 p-0 text-white hover:bg-transparent"
    >
      <span
        className={cn(
          "rounded-full border border-white/10 bg-black/40 p-3 backdrop-blur-md transition-all",
          "group-hover:border-white/25 group-hover:bg-black/60 group-active:scale-90",
          active && activeClassName
        )}
      >
        <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-transform", fill && "fill-current")} />
      </span>
      <span className="text-[11px] font-medium tabular-nums drop-shadow-md sm:text-xs">{label}</span>
    </Button>
  )
}

function VideoPlayer({ video, onInteraction, onDeleted }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [interaction, setInteraction] = useState(video.liked ? 'like' : null)
  const [counts, setCounts] = useState({ likes: video.likes, dislikes: video.dislikes })
  const [showThumb, setShowThumb] = useState(false)
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false)
  const [progress, setProgress] = useState(0)

  const manageInteraction = useCallback((type) => {
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
          likes: prev.likes + (interaction === 'like' ? -1 : interaction === 'dislike' ? 1 : 1),
          dislikes: interaction === 'dislike' ? prev.dislikes - 1 : prev.dislikes
        }
      } else {
        return {
          likes: interaction === 'like' ? prev.likes - 1 : prev.likes,
          dislikes: prev.dislikes + (interaction === 'dislike' ? -1 : interaction === 'like' ? 1 : 1)
        }
      }
    })

    onInteraction(type, video.id)

    const sendInteraction = async () => {
      try {
        if (type === 'like') {
          const r = await fetch(`${BASE_API}/v${API_VERSION}/likes/${video.id}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } })
          const j = await r.json()
          if (!r.ok) {
            toast.error(j.message || 'Like failed')
          } else {
            setCounts(prev => ({ ...prev, likes: typeof j.likes === 'number' ? j.likes : prev.likes }))
            toast.success(j.liked ? 'Added to liked' : 'Removed from liked')
            onInteraction('like_state', video.id, { liked: j.liked })
          }
        } else {
          const r = await fetch(`${BASE_API}/v${API_VERSION}/dislikes/${video.id}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } })
          const j = await r.json()
          if (!r.ok) {
            toast.error(j.message || 'Dislike failed')
          } else {
            setCounts(prev => ({ ...prev, dislikes: typeof j.dislikes === 'number' ? j.dislikes : prev.dislikes }))
            toast.success(j.disliked ? 'Added to dislikes' : 'Removed dislike')
            onInteraction('dislike_state', video.id, { disliked: j.disliked })
          }
        }
      } catch {
        toast.error('Network error')
      }
    }
    sendInteraction()
  }, [interaction, video.id, onInteraction])

  useEffect(() => {
    setInteraction(video.liked ? 'like' : (video.disliked ? 'dislike' : null))
  }, [video.liked, video.disliked, video.id])

  useEffect(() => {
    const loadRelationship = async () => {
      if (!user || !video.userId || user.id === video.userId) { setIsFollowingAuthor(false); return }
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/relationship/${video.userId}`, { headers: { 'Authorization': localStorage.getItem('token') } })
        const j = await r.json()
        if (r.ok) setIsFollowingAuthor(!!j.i_follow)
      } catch {}
    }
    loadRelationship()
  }, [user, video.userId])

  useEffect(() => {
    let timer
    if (showThumb) {
      timer = setTimeout(() => setShowThumb(false), 1000)
    }
    return () => clearTimeout(timer)
  }, [showThumb])

  const isOwner = user?.id && user.id === video.userId

  return (
    <div className="relative mx-auto h-full w-full overflow-hidden bg-black md:aspect-[9/16] md:h-full md:w-auto md:rounded-3xl md:border md:border-white/10">
      {video.playback_id ? (
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
      ) : (
        <img
          src={"/placeholder.svg?height=1920&width=1080"}
          alt={video.description}
          className="h-full w-full object-cover"
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
      />

      <div className="absolute left-2 sm:left-4 bottom-28 sm:bottom-32 z-10 max-w-[70%] text-white">
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

      <div className="absolute top-2 right-2 z-10">
        <VideoActionMenu
          videoId={video.id}
          isOwner={isOwner}
          onDeleted={onDeleted}
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

      <div className="absolute right-2 sm:right-4 md:right-6 bottom-24 sm:bottom-28 md:bottom-32 z-10 flex flex-col items-center gap-4 sm:gap-5">
        {!isOwner && !isFollowingAuthor && (
          <ActionButton icon={UserPlus} label="Suivre" />
        )}

        <ActionButton
          icon={ThumbsUp}
          label={counts.likes.toLocaleString()}
          onClick={() => manageInteraction('like')}
          active={interaction === 'like' || video.liked}
          activeClassName="border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-500"
          fill={interaction === 'like' || video.liked}
        />

        <ActionButton
          icon={ThumbsDown}
          label={counts.dislikes.toLocaleString()}
          onClick={() => manageInteraction('dislike')}
          active={interaction === 'dislike' || video.disliked}
          activeClassName="border-transparent bg-red-500"
          fill={interaction === 'dislike' || video.disliked}
        />

        <ActionButton
          icon={MessageCircle}
          label={video.comments}
          onClick={() => onInteraction('comment', video.id)}
        />

        <ActionButton
          icon={Share2}
          label="Partager"
          onClick={() => onInteraction('share', video.id)}
        />
      </div>

      {video.playback_id && (
        <div className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-white/15">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function VideoScreen() {
  const navigate = useNavigate()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const containerRef = useRef(null)
  const [videos, setVideos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      try {
        const response = await fetch(`${BASE_API}/v${API_VERSION}/videos`)
        const json = await response.json()
        if (!response.ok) {
          setError(json.message || 'Impossible to fetch videos.')
          return
        }

        const mapped = json.map(v => ({
          id: v.id,
          playback_id: v.playback_id,
          title: v.title,
          description: v.description,
          userId: v.userId,
          username: v.username,
          likes: typeof v.likes === 'number' ? v.likes : 0,
          dislikes: typeof v.dislikes === 'number' ? v.dislikes : 0,
          comments: 0,
          liked: false,
          disliked: false
        }))
        setVideos(mapped)

        const token = localStorage.getItem('token')
        if (token) {
          try {
            const [rLikes, rDislikes] = await Promise.all([
              fetch(`${BASE_API}/v${API_VERSION}/likes/me`, { headers: { 'Authorization': token } }),
              fetch(`${BASE_API}/v${API_VERSION}/dislikes/me`, { headers: { 'Authorization': token } })
            ])
            const [jLikes, jDislikes] = await Promise.all([rLikes.json(), rDislikes.json()])
            const likedIds = (rLikes.ok && Array.isArray(jLikes)) ? new Set(jLikes.map(v => v.id)) : new Set()
            const dislikedIds = (rDislikes.ok && Array.isArray(jDislikes)) ? new Set(jDislikes.map(v => v.id)) : new Set()
            setVideos(prev => prev.map(v => ({
              ...v,
              liked: likedIds.has(v.id) && !dislikedIds.has(v.id),
              disliked: dislikedIds.has(v.id) && !likedIds.has(v.id)
            })))
          } catch {}
        }

        const resolved = await resolvePlaybackIds(mapped)
        if (resolved !== mapped) setVideos(resolved)
      } catch {
        setError('Network error to load videos.')
      }
    }
    load()
  }, [])

  const hasVideos = videos && videos.length > 0

  const manageInteraction = useCallback((type, videoId, payload) => {
    if (type === 'comment') {
      setShowComments(true)
    } else if (type === 'share') {
      setShareUrl(`${window.location.origin}/video/${videoId}`)
      setShowShare(true)
    } else if (type === 'like_state') {
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, liked: !!(payload && payload.liked), disliked: (payload && payload.liked) ? false : v.disliked } : v))
    } else if (type === 'dislike_state') {
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, disliked: !!(payload && payload.disliked), liked: (payload && payload.disliked) ? false : v.liked } : v))
    }
  }, [])

  const manageScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollPosition = container.scrollTop
    const videoHeight = container.clientHeight
    const newIndex = Math.round(scrollPosition / videoHeight)

    if (newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex)
    }
  }, [currentVideoIndex])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', manageScroll)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', manageScroll)
      }
    }
  }, [manageScroll])

  useEffect(() => {
    const id = videos[currentVideoIndex]?.id
    if (!id) return
    ;(async () => {
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/comments/counts?ids=${encodeURIComponent(id)}`)
        const j = await r.json()
        if (r.ok && j && typeof j === 'object') {
          const n = Number(j[id] || 0)
          setVideos(prev => prev.map(v => v.id === id ? { ...v, comments: n } : v))
        }
      } catch {}
    })()
  }, [currentVideoIndex, videos])

  return (
    <div className="vibby-landing relative h-screen w-full overflow-hidden bg-[#07070a] text-white antialiased selection:bg-fuchsia-500/30">
      <AnimatePresence>
        {showComments && (
          <div key="comments" className="absolute inset-0 bg-black/50 z-40">
            <CommentsOverlay
              onClose={() => setShowComments(false)}
              videoId={videos[currentVideoIndex]?.id}
              videoOwnerId={videos[currentVideoIndex]?.userId}
              onAdded={() => setVideos(prev => prev.map(v => v.id === videos[currentVideoIndex]?.id ? { ...v, comments: (v.comments || 0) + 1 } : v))}
            />
          </div>
        )}

        {showShare && (
          <div key="share" className="absolute inset-0 bg-black/50 z-40">
            <ShareOverlay onClose={() => setShowShare(false)} url={shareUrl} />
          </div>
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

      <div
        ref={containerRef}
        className="vibby-scroller h-[calc(100%-4.5rem)] snap-y snap-mandatory overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {hasVideos ? videos.map((video, index) => (
          <div key={video.id || index} className="flex h-full snap-start items-center justify-center md:py-4">
            <VideoPlayer
              video={video}
              onInteraction={manageInteraction}
              onDeleted={(id) => setVideos(prev => prev.filter(v => v.id !== id))}
            />
          </div>
        )) : (
          <div className="grid h-full place-items-center px-6">
            <div className="max-w-sm text-center">
              <p className="text-2xl font-extrabold tracking-tight">
                {error ? 'Ça coince.' : 'Rien à voir.'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/45">
                {error || "Aucune vidéo pour l'instant. Sois le premier à poster."}
              </p>
              {!error && (
                <Button
                  variant="ghost"
                  size={null}
                  onClick={() => navigate('/upload')}
                  className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.03] active:scale-95"
                >
                  Poster une vidéo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
