import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/nav/BottomNav'
import MuxPlayer from '@mux/mux-player-react'
import { ArrowLeft } from 'lucide-react'
import VideoActionMenu from '@/components/video/VideoActionMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { BASE_API, API_VERSION } from '../../config.json'

export default function VideoWatch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
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
        } else {
          setVideo(j)
        }
      } catch {
        setError('Network error while loading the video.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const isOwner = user?.id && video?.userId && user.id === video.userId

  return (
    <div className="relative h-screen w-full max-w-7xl mx-auto bg-gradient-to-b from-cyan-900 to-sky-400 overflow-hidden">
      <div className="absolute top-2 left-2 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-full grid place-items-center">
        {loading ? (
          <div className="text-white">Loading...</div>
        ) : error ? (
          <div className="text-white">{error}</div>
        ) : video && video.playback_id ? (
          <div className="relative w-full h-full">
            <MuxPlayer playbackId={video.playback_id} streamType="on-demand" className="object-cover w-full h-full" autoPlay muted loop />
            <div className="absolute top-2 right-2 z-10">
              <VideoActionMenu
                videoId={video.id}
                isOwner={isOwner}
                onDeleted={() => navigate(-1)}
                triggerClassName="text-white hover:bg-white/20"
                menuClassName="bg-black/60 backdrop-blur text-white"
              />
            </div>
            <div className="absolute left-2 bottom-24 text-white max-w-[70%]">
              {video.title && (<div className="text-lg font-semibold drop-shadow-md">{video.title}</div>)}
              {video.description && (<div className="text-sm opacity-90 drop-shadow-md">{video.description}</div>)}
            </div>
          </div>
        ) : (
          <div className="text-white">Processing to the video...</div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
