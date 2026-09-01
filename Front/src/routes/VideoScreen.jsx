import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from "@/lib/hooks/useAuth"
import BottomNav from "@/components/nav/BottomNav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle, Share2, ThumbsUp, UserPlus, Play, Volume2, VolumeX } from 'lucide-react'
import VideoActionMenu from '@/components/video/VideoActionMenu'
import ActionButton from '@/components/video/ActionButton'
import SearchPopover from '@/components/video/SearchPopover'
import CommentsOverlay from '@/components/video/CommentsOverlay'
import ShareOverlay from '@/components/video/ShareOverlay'
import LoginPromptDialog from '@/components/auth/LoginPromptDialog'
import { toast } from 'sonner'
import { resolvePlaybackIds } from "@/lib/utils"
import { useVideoLike } from "@/lib/hooks/useVideoLike"
import { BASE_API, API_VERSION } from "../config.json"
import MuxPlayer from '@mux/mux-player-react'

const FEED_PAGE_SIZE = 6
const PREFETCH_THRESHOLD = 2 
const LOGIN_PROMPT_AFTER = 4 

function VideoPlayer({ video, muted, requireAuth, onInteraction, onDeleted }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const playerRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false)
  const [progress, setProgress] = useState(0)

  const onLikeState = useCallback(
    (isLiked) => onInteraction('like_state', video.id, { liked: isLiked }),
    [onInteraction, video.id],
  )
  const { liked, likes, showThumb, toggleLike } = useVideoLike(video, { requireAuth, onLikeState })

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

  const isOwner = user?.id && user.id === video.userId

  const manageFollow = useCallback(async () => {
    if (requireAuth && !requireAuth()) return
    if (!video.userId) return
    setIsFollowingAuthor(true) 
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/${video.userId}`, {
        method: 'POST',
        headers: { 'Authorization': localStorage.getItem('token') },
      })
      const j = await r.json()
      if (!r.ok) {
        setIsFollowingAuthor(false)
        toast.error(j.message || 'L\'abonnement a échoué')
      } else {
        setIsFollowingAuthor(!!j.following)
        toast.success(j.following ? 'Abonné' : 'Désabonné')
      }
    } catch {
      setIsFollowingAuthor(false)
      toast.error('Erreur réseau')
    }
  }, [video.userId, requireAuth])

  const togglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (player.paused) {
      player.play()?.catch(() => {})
      setPaused(false)
    } else {
      player.pause()
      setPaused(true)
    }
  }, [])

  return (
      <div className="relative mx-auto h-full w-full overflow-hidden bg-black md:aspect-[9/16] md:h-full md:w-auto md:rounded-3xl md:border md:border-white/10">
      {video.playback_id ? (
        <MuxPlayer
          ref={playerRef}
          playbackId={video.playback_id}
          streamType="on-demand"
          className="vibby-player h-full w-full object-cover"
          autoPlay
          muted={muted}
          loop
          nohotkeys
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
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

      {video.playback_id && (
        <button
          type="button"
          aria-label={paused ? 'Lecture' : 'Pause'}
          onClick={togglePlay}
          className="absolute inset-0 z-[5] flex items-center justify-center"
        >
          <AnimatePresence>
            {paused && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-full bg-black/45 p-5 backdrop-blur-md"
              >
                <Play className="h-10 w-10 fill-white text-white" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
      />

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

      <div className="absolute top-2 right-2 z-10">
        <VideoActionMenu
          videoId={video.id}
          isOwner={isOwner}
          onDeleted={onDeleted}
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
            <ThumbsUp className="h-28 w-28 fill-fuchsia-500 text-fuchsia-500 drop-shadow-[0_0_35px_rgba(236,72,153,0.55)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute right-2 sm:right-4 md:right-6 bottom-24 sm:bottom-28 md:bottom-32 z-10 flex flex-col items-center gap-4 sm:gap-5">
        {!isOwner && !isFollowingAuthor && (
          <ActionButton icon={UserPlus} label="Suivre" onClick={manageFollow} />
        )}

        <ActionButton
          icon={ThumbsUp}
          label={likes.toLocaleString()}
          onClick={toggleLike}
          active={liked}
          activeClassName="border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-500"
          fill={liked}
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
  const { user } = useAuth()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [muted, setMuted] = useState(true)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const promptedRef = useRef(false)

  const requireAuth = useCallback(() => {
    if (user) return true
    if (!promptedRef.current) {
      promptedRef.current = true
      setShowLoginPrompt(true)
    } else {
      setShowLoginPrompt(true)
    }
    return false
  }, [user])
  const containerRef = useRef(null)
  const [videos, setVideos] = useState([])
  const [error, setError] = useState('')
  const cursorRef = useRef(null)
  const loadingRef = useRef(false)
  const reachedEndRef = useRef(false)
  const likedSetRef = useRef(null)

  const loadPage = useCallback(async () => {
    if (loadingRef.current || reachedEndRef.current) return
    loadingRef.current = true
    try {
      const token = localStorage.getItem('token')

      if (likedSetRef.current === null) {
        likedSetRef.current = new Set()
        if (token) {
          try {
            const rLikes = await fetch(`${BASE_API}/v${API_VERSION}/likes/me`, { headers: { 'Authorization': token } })
            const jLikes = await rLikes.json()
            if (rLikes.ok && Array.isArray(jLikes)) likedSetRef.current = new Set(jLikes.map(v => v.id))
          } catch {}
        }
      }

      const params = new URLSearchParams({ limit: String(FEED_PAGE_SIZE) })
      if (cursorRef.current) params.set('cursor', cursorRef.current)
      const headers = token ? { 'Authorization': token } : undefined
      const response = await fetch(`${BASE_API}/v${API_VERSION}/videos?${params}`, { headers })
      const json = await response.json()
      if (!response.ok) {
        setError(json.message || 'Impossible de charger les vidéos.')
        return
      }

      const items = Array.isArray(json.items) ? json.items : []
      cursorRef.current = json.nextCursor || null
      if (!json.nextCursor) reachedEndRef.current = true

      const mapped = items.map(v => ({
        id: v.id,
        playback_id: v.playback_id,
        title: v.title,
        description: v.description,
        userId: v.userId,
        username: v.username,
        likes: typeof v.likes === 'number' ? v.likes : 0,
        comments: typeof v.commentCount === 'number' ? v.commentCount : 0,
        liked: likedSetRef.current.has(v.id),
      }))

      const resolved = await resolvePlaybackIds(mapped)
      const page = resolved !== mapped ? resolved : mapped

      setVideos(prev => {
        const seen = new Set(prev.map(v => v.id))
        return [...prev, ...page.filter(v => !seen.has(v.id))]
      })
    } catch {
      setError('Erreur réseau lors du chargement des vidéos.')
    } finally {
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const hasVideos = videos && videos.length > 0

  const manageInteraction = useCallback((type, videoId, payload) => {
    if (type === 'comment') {
      if (!requireAuth()) return
      setShowComments(true)
    } else if (type === 'share') {
      setShareUrl(`${window.location.origin}/video/${videoId}`)
      setShowShare(true)
    } else if (type === 'like_state') {
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, liked: !!(payload && payload.liked) } : v))
    }
  }, [requireAuth])

  const manageScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollPosition = container.scrollTop
    const videoHeight = container.clientHeight
    const newIndex = Math.round(scrollPosition / videoHeight)

    if (newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex)
    }

    if (newIndex >= videos.length - PREFETCH_THRESHOLD) {
      loadPage()
    }

    if (!user && !promptedRef.current && newIndex >= LOGIN_PROMPT_AFTER) {
      promptedRef.current = true
      setShowLoginPrompt(true)
    }
  }, [currentVideoIndex, videos.length, loadPage, user])

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

  const activeVideoId = videos[currentVideoIndex]?.id

  useEffect(() => {
    if (!activeVideoId) return
    const id = activeVideoId
    ;(async () => {
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/comments/counts?ids=${encodeURIComponent(id)}`)
        const j = await r.json()
        if (r.ok && j && typeof j === 'object') {
          const n = Number(j[id] || 0)
          setVideos(prev => prev.map(v => v.id === id ? { ...v, comments: n } : v))
        }
      } catch {}

      const token = localStorage.getItem('token')
      if (token) {
        try {
          await fetch(`${BASE_API}/v${API_VERSION}/views/${id}`, {
            method: 'POST',
            headers: { 'Authorization': token },
          })
        } catch {}
      }
    })()
  }, [activeVideoId])

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
                videoId={videos[currentVideoIndex]?.id}
                videoOwnerId={videos[currentVideoIndex]?.userId}
                onAdded={() => setVideos(prev => prev.map(v => v.id === videos[currentVideoIndex]?.id ? { ...v, comments: (v.comments || 0) + 1 } : v))}
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

      <div className="absolute top-3 sm:top-5 right-3 sm:right-5 z-20 flex items-center gap-2">
        <Button
          variant="ghost"
          size={null}
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Activer le son' : 'Couper le son'}
          className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <SearchPopover />
      </div>

      <div
        ref={containerRef}
        className="vibby-scroller h-[calc(100%-4.5rem)] snap-y snap-mandatory overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {hasVideos ? videos.map((video, index) => (
          <div key={video.id || index} className="relative flex h-full snap-start items-center justify-center md:py-4">
            {video.playback_id && (
              <div aria-hidden className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
                <img
                  src={`https://image.mux.com/${video.playback_id}/thumbnail.jpg`}
                  alt=""
                  style={{
                    maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 72%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 72%)',
                  }}
                  className="absolute h-[90%] w-[75rem] max-w-[95vw] animate-ambilight object-cover opacity-50 blur-[130px] saturate-[1.8]"
                />
                <img
                  src={`https://image.mux.com/${video.playback_id}/thumbnail.jpg`}
                  alt=""
                  style={{
                    maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 68%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 68%)',
                  }}
                  className="absolute h-[80%] w-[34rem] max-w-[80vw] animate-ambilight object-cover opacity-80 blur-[70px] saturate-[1.6]"
                />
              </div>
            )}
            <VideoPlayer
              video={video}
              muted={muted}
              requireAuth={requireAuth}
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

      <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />

      <BottomNav />
    </div>
  )
}
