import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Heart, MessageCircle, Share2, ThumbsDown, UserPlus } from 'lucide-react'

export default function TikTokVideo() {
  const navigate = useNavigate()

  return (
    <div className="relative h-screen w-full max-w-md mx-auto bg-gradient-to-b from-cyan-900 to-sky-400">
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Avatar className="h-8 w-8 border-2 border-white">
          <AvatarImage src="/placeholder.svg" alt="User avatar" />
          <AvatarFallback>UV</AvatarFallback>
        </Avatar>
      </div>

      <div className="relative h-full w-full">
        <img
          src="/placeholder.svg?height=1920&width=1080"
          alt=""
          className="object-cover w-full h-full"
        />
      </div>

      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
        <button className="flex flex-col items-center gap-1">
          <div className="bg-gray-800/40 p-3 rounded-full">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs">Follow</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="bg-gray-800/40 p-3 rounded-full">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs">15K</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="bg-gray-800/40 p-3 rounded-full">
            <ThumbsDown className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs">100</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="bg-gray-800/40 p-3 rounded-full">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs">456</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="bg-gray-800/40 p-3 rounded-full">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs">Share</span>
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="w-full bg-gray-200/30 rounded-full h-1">
          <div className="bg-white w-1/3 h-1 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
