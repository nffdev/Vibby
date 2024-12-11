import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle, Share2, ThumbsDown, ThumbsUp, UserPlus } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function VideoScreen() {
  const navigate = useNavigate()
  const [interaction, setInteraction] = useState(null)
  const [counts, setCounts] = useState({ likes: 15000, dislikes: 100 })
  const [showThumb, setShowThumb] = useState(false)

  const handleInteraction = useCallback((type) => {
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
  }, [interaction])

  useEffect(() => {
    let timer
    if (showThumb) {
      timer = setTimeout(() => setShowThumb(false), 1000)
    }
    return () => clearTimeout(timer)
  }, [showThumb])

  return (
    <div className="relative h-screen w-full max-w-7xl mx-auto bg-gradient-to-b from-cyan-900 to-sky-400 overflow-hidden">
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
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-white">
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

      <div className="absolute right-1 sm:right-2 md:right-4 bottom-12 sm:bottom-16 md:bottom-20 flex flex-col items-center gap-2 sm:gap-4 md:gap-6">
        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-1.5 sm:p-2 md:p-3 rounded-full">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </div>
          <span className="text-[10px] sm:text-xs mt-1">Follow</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleInteraction('like')}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className={cn(
            "bg-gray-800/40 p-1.5 sm:p-2 md:p-3 rounded-full transition-colors",
            interaction === 'like' && "bg-blue-500"
          )}>
            <ThumbsUp 
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-all",
                interaction === 'like' && "fill-white"
              )} 
            />
          </div>
          <span className="text-[10px] sm:text-xs mt-1">{counts.likes.toLocaleString()}</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleInteraction('dislike')}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent"
        >
          <div className={cn(
            "bg-gray-800/40 p-1.5 sm:p-2 md:p-3 rounded-full transition-colors",
            interaction === 'dislike' && "bg-red-500"
          )}>
            <ThumbsDown 
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-all",
                interaction === 'dislike' && "fill-white"
              )} 
            />
          </div>
          <span className="text-[10px] sm:text-xs mt-1">{counts.dislikes.toLocaleString()}</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-1.5 sm:p-2 md:p-3 rounded-full">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </div>
          <span className="text-[10px] sm:text-xs mt-1">456</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent">
          <div className="bg-gray-800/40 p-1.5 sm:p-2 md:p-3 rounded-full">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </div>
          <span className="text-[10px] sm:text-xs mt-1">Share</span>
        </Button>
      </div>

      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
        <div className="w-full bg-gray-200/30 rounded-full h-0.5 sm:h-1">
          <div className="bg-white w-1/3 h-0.5 sm:h-1 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
