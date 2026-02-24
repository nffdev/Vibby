import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Share2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function ShareOverlay({ onClose, url }) {
  const shareOptions = ['Share', 'Copy Link']

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
            onClick={async () => {
              if (option === 'Copy Link') {
                try {
                  await navigator.clipboard.writeText(url)
                  toast.success('Link copied')
                  onClose()
                } catch {
                  toast.error('Copy failed')
                }
              }
            }}
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
