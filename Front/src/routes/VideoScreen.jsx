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

function VideoPlayer({ video, onInteraction, onDeleted }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [interaction, setInteraction] = useState(video.liked ? 'like' : null)
  const [counts, setCounts] = useState({ likes: video.likes, dislikes: video.dislikes })
  const [showThumb, setShowThumb] = useState(false)
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false)

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
    <div className="relative h-full w-full">
      {video.playback_id ? (
        <MuxPlayer
          playbackId={video.playback_id}
          streamType="on-demand"
          className="object-cover w-full h-full"
          autoPlay
          muted
          loop
        />
      ) : (
        <img
          src={"/placeholder.svg?height=1920&width=1080"}
          alt={video.description}
          className="object-cover w-full h-full"
        />
      )}

      <div className="absolute left-2 sm:left-4 bottom-28 sm:bottom-32 text-white max-w-[70%]">
        {video.title && (
          <div className="text-lg sm:text-xl font-semibold drop-shadow-md">{video.title}</div>
        )}
        {video.description && (
          <div className="text-sm sm:text-base opacity-90 drop-shadow-md">{video.description}</div>
        )}
        {(video.username || video.userId) && (
          <button onClick={() => navigate(video.username ? `/profile?u=${video.username}` : `/profile?id=${video.userId}`)} className="text-xs sm:text-sm opacity-90 drop-shadow-md underline">
            by {video.username ? `@${video.username}` : video.userId}
          </button>
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            {interaction === 'like' ? (
              <ThumbsUp className="w-32 h-32 text-blue-500" />
            ) : (
              <ThumbsDown className="w-32 h-32 text-red-500" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute right-2 sm:right-4 md:right-6 bottom-24 sm:bottom-28 md:bottom-32 flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
        {!isOwner && !isFollowingAuthor && (
          <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group">
            <div className="bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors">
              <UserPlus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
            </div>
            <span className="text-xs sm:text-sm md:text-base mt-2">Follow</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => manageInteraction('like')}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className={cn(
            "bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors",
            (interaction === 'like' || video.liked) && "bg-blue-500"
          )}>
            <ThumbsUp
              className={cn(
                "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all",
                (interaction === 'like' || video.liked) && "fill-white"
              )}
            />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">{counts.likes.toLocaleString()}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => manageInteraction('dislike')}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className={cn(
            "bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors",
            (interaction === 'dislike' || video.disliked) && "bg-red-500"
          )}>
            <ThumbsDown
              className={cn(
                "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all",
                (interaction === 'dislike' || video.disliked) && "fill-white"
              )}
            />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">{counts.dislikes.toLocaleString()}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onInteraction('comment', video.id)}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className="bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors">
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">{video.comments}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onInteraction('share', video.id)}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className="bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors">
            <Share2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">Share</span>
        </Button>
      </div>
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
    console.log(`Interaction: ${type} on video ${videoId}`)
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
    <div className="relative h-screen w-full max-w-7xl mx-auto bg-gradient-to-b from-cyan-900 to-sky-400 overflow-hidden">
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

      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
      </div>

      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className="bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors">
            <Search className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </div>
        </Button>
      </div>

      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {hasVideos ? videos.map((video, index) => (
          <div key={video.id || index} className="h-full snap-start">
            <VideoPlayer
              video={video}
              onInteraction={manageInteraction}
              onDeleted={(id) => setVideos(prev => prev.filter(v => v.id !== id))}
            />
          </div>
        )) : (
          <div className="h-full grid place-items-center">
            <div className="text-white text-center">
              {error ? error : 'No video at the moment.'}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 right-2 sm:right-4">
        <div className="w-full bg-gray-200/30 rounded-full h-0.5 sm:h-1">
          <div
            className="bg-white h-0.5 sm:h-1 rounded-full transition-all duration-300"
          ></div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
