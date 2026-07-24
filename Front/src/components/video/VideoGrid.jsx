import { Play } from 'lucide-react'
import VideoActionMenu from './VideoActionMenu'

function VideoCard({ video, onSelect, isOwner, onDeleted }) {
  return (
    <div className="group relative aspect-[9/14] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <button className="absolute inset-0 z-[1]" onClick={() => onSelect(video.id)} aria-label="open" />
      <img src={video.thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
        <Play className="h-10 w-10 fill-white text-white" />
      </div>
      <div className="absolute right-2 top-2 z-10">
        <VideoActionMenu
          videoId={video.id}
          isOwner={isOwner}
          onDeleted={onDeleted}
          triggerClassName="text-white bg-black/40 backdrop-blur-md hover:bg-black/60"
          menuClassName="bg-black/70 backdrop-blur text-white"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <h3 className="truncate text-sm font-semibold text-white drop-shadow-md">{video.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-white/60">
          <Play className="h-3 w-3" />
          <span className="tabular-nums">{typeof video.views === 'number' ? video.views.toLocaleString() : 0} vues</span>
        </div>
      </div>
    </div>
  )
}

export default function VideoGrid({ videos, onSelect, isOwner, onDeleted }) {
  return (
    <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onSelect={onSelect}
          isOwner={isOwner}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  )
}
