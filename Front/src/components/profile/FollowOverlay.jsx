import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FollowOverlay({ title, users, onClose, onToggle, showFollowBackLabel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-xl z-50 flex flex-col max-h-[80vh]"
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {users.map((user, i) => (
            <div key={i} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex flex-col">
                <Link to={user.username ? `/profile?u=${user.username}` : `/profile?id=${user.id}`} onClick={onClose} className="text-sm font-medium no-underline">
                  {user.name}
                </Link>
                <Link to={user.username ? `/profile?u=${user.username}` : `/profile?id=${user.id}`} onClick={onClose} className="text-xs text-gray-500 dark:text-gray-400 no-underline">
                  {user.username}
                </Link>
              </div>
              <Button variant="outline" size="sm" onClick={() => onToggle && onToggle(user)}>
                {user.isFollowing ? 'Unfollow' : (showFollowBackLabel ? 'Follow back' : 'Follow')}
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
