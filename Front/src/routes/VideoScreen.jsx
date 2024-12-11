import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageCircle, Share2, ThumbsDown, UserPlus } from 'lucide-react'

export default function TikTokVideo() {
  const navigate = useNavigate()

  return (
    <div className="relative h-screen w-full max-w-md mx-auto bg-gradient-to-b from-cyan-900 to-sky-400 overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
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

      <div className="absolute right-2 bottom-16 sm:right-4 sm:bottom-20 flex flex-col items-center gap-4 sm:gap-6">
        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-2 sm:p-3 rounded-full">
            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs mt-1">Follow</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-2 sm:p-3 rounded-full">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs mt-1">15K</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-2 sm:p-3 rounded-full">
            <ThumbsDown className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs mt-1">100</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-2 sm:p-3 rounded-full">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs mt-1">456</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-2 sm:p-3 rounded-full">
            <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-xs mt-1">Share</span>
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="w-full bg-gray-200/30 rounded-full h-1">
          <div className="bg-white w-1/3 h-1 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
