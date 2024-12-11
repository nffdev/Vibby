import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BottomNav from "@/components/nav/BottomNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Share2, ThumbsDown, ThumbsUp, UserPlus, X, Search} from 'lucide-react'
import { cn } from "@/lib/utils"

function CommentsOverlay({ onClose }) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-xl z-50 max-h-[80vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Comments</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/placeholder.svg?${i}`} />
              <AvatarFallback>U{i}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">User{i + 1}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contrary to popular belief, Lorem Ipsum is not simply random text
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-900 border-t">
        <Input 
          placeholder="Add comment..." 
          className="bg-gray-100 dark:bg-gray-800 border-0"
        />
      </div>
    </motion.div>
  )
}

function ShareOverlay({ onClose }) {
  const shareOptions = [
    'Share', 'Copy Link',
  ]

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-xl z-50"
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Share to</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4">
        {shareOptions.map((option, i) => (
          <button
            key={i}
            className="flex flex-col items-center gap-2"
          >
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <Share2 className="h-6 w-6" />
            </div>
            <span className="text-xs text-center">{option}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default function VideoScreen() {
  const navigate = useNavigate()
  const [interaction, setInteraction] = useState(null)
  const [counts, setCounts] = useState({ likes: 15000, dislikes: 100 })
  const [showThumb, setShowThumb] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)

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

        {showComments && (
          <div className="absolute inset-0 bg-black/50 z-40">
            <CommentsOverlay onClose={() => setShowComments(false)} />
          </div>
        )}

        {showShare && (
          <div className="absolute inset-0 bg-black/50 z-40">
            <ShareOverlay onClose={() => setShowShare(false)} />
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

      <div className="relative h-full w-full">
        <img
          src="/placeholder.svg?height=1920&width=1080"
          alt=""
          className="object-cover w-full h-full"
        />
      </div>

      <div className="absolute right-2 sm:right-4 md:right-6 bottom-24 sm:bottom-28 md:bottom-32 flex flex-col items-center gap-4 sm:gap-6 md:gap-8"> 
        <Button variant="ghost" size="icon" className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group">
          <div className="bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors">
            <UserPlus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">Follow</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleInteraction('like')}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className={cn(
            "bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors",
            interaction === 'like' && "bg-blue-500"
          )}>
            <ThumbsUp 
              className={cn(
                "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all",
                interaction === 'like' && "fill-white"
              )} 
            />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">{counts.likes.toLocaleString()}</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleInteraction('dislike')}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className={cn(
            "bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors",
            interaction === 'dislike' && "bg-red-500"
          )}>
            <ThumbsDown 
              className={cn(
                "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all",
                interaction === 'dislike' && "fill-white"
              )} 
            />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">{counts.dislikes.toLocaleString()}</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className="bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors">
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">456</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowShare(true)}
          className="flex flex-col items-center p-0 h-auto text-white hover:bg-transparent group"
        >
          <div className="bg-gray-800/40 p-2 sm:p-3 md:p-4 rounded-full group-hover:bg-gray-700/60 transition-colors">
            <Share2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </div>
          <span className="text-xs sm:text-sm md:text-base mt-2">Share</span>
        </Button>
      </div>

      <div className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 right-2 sm:right-4"> 
        <div className="w-full bg-gray-200/30 rounded-full h-0.5 sm:h-1">
          <div className="bg-white w-1/3 h-0.5 sm:h-1 rounded-full"></div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
