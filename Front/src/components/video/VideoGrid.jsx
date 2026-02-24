import { Play } from 'lucide-react'
import VideoActionMenu from './VideoActionMenu'

function VideoCard({ video, onSelect, isOwner, onDeleted }) {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      <button className="absolute inset-0" onClick={() => onSelect(video.id)} aria-label="open" />
      <img src={video.thumbnail} alt="" className="w-full h-40 object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <Play className="w-12 h-12 text-white" />
      </div>
      <div className="absolute top-2 right-2 z-10">
        <VideoActionMenu
          videoId={video.id}
          isOwner={isOwner}
          onDeleted={onDeleted}
          triggerClassName="bg-white/40 hover:bg-white/60"
          menuClassName="bg-black/70 text-white"
        />
      </div>
      <div className="p-2 bg-white">
        <h3 className="font-semibold text-sm truncate">{video.title}</h3>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Play className="w-3 h-3 mr-1" />
          <span>{typeof video.views === 'number' ? video.views.toLocaleString() : 0} views</span>
        </div>
      </div>
    </div>
  )
}

export default function VideoGrid({ videos, onSelect, isOwner, onDeleted }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
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
