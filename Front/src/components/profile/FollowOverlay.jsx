import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from "@/lib/utils"

export default function FollowOverlay({ title, users, onClose, onToggle, showFollowBackLabel }) {
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="pointer-events-auto flex max-h-[80vh] w-full flex-col rounded-t-3xl border-t border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl md:max-w-md md:rounded-3xl md:border"
      >
        <div className="shrink-0 px-5 pb-4 pt-3">
          <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size={null}
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-5">
          {users.length ? (
            users.map((user, i) => (
              <div key={user.id || i} className="flex items-center gap-3">
                <Link to={user.username ? `/profile?u=${user.username}` : `/profile?id=${user.id}`} onClick={onClose} className="shrink-0">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-white/10 text-xs font-medium text-white/70">{(user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link
                  to={user.username ? `/profile?u=${user.username}` : `/profile?id=${user.id}`}
                  onClick={onClose}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  {user.username && <p className="truncate text-xs text-white/40">@{user.username}</p>}
                </Link>
                <Button
                  variant="ghost"
                  size={null}
                  onClick={() => onToggle && onToggle(user)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    user.isFollowing
                      ? "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      : "bg-white text-black hover:bg-white"
                  )}
                >
                  {user.isFollowing ? 'Abonné' : (showFollowBackLabel ? 'Suivre en retour' : 'Suivre')}
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Users className="h-8 w-8 text-white/15" />
              <p className="text-sm text-white/40">Personne pour l'instant.</p>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </>
  )
}
