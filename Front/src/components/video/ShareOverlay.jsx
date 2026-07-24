import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Check, Copy, Share2, Mail, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

const TARGETS = [
  {
    key: 'x',
    label: 'X',
    className: 'from-zinc-600 to-zinc-800',
    href: (url) => `https://x.com/intent/tweet?url=${encodeURIComponent(url)}`,
    icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z" />
      </svg>
    ),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    className: 'from-emerald-500 to-green-600',
    href: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
    icon: MessageCircle,
  },
  {
    key: 'mail',
    label: 'Mail',
    className: 'from-violet-500 to-fuchsia-500',
    href: (url) => `mailto:?subject=${encodeURIComponent('Regarde cette vidéo sur Vibby')}&body=${encodeURIComponent(url)}`,
    icon: Mail,
  },
]

export default function ShareOverlay({ onClose, url }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  const shareNative = async () => {
    try {
      await navigator.share({ url, title: 'Vibby' })
    } catch {}
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Partager"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 26, stiffness: 280 }}
      className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl md:mx-auto md:max-w-lg md:rounded-3xl"
    >
      <div className="px-5 pb-4 pt-3">
        <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Partager</h2>
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

      <div className="flex gap-3 px-5 pb-5">
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={shareNative}
            className="group flex flex-1 flex-col items-center gap-2"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-transform group-hover:scale-105 group-active:scale-95">
              <Share2 className="h-5 w-5" />
            </span>
            <span className="text-[11px] text-white/50">Autre</span>
          </button>
        )}

        {TARGETS.map(({ key, label, className, href, icon: Icon }) => (
          <a
            key={key}
            href={href(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-1 flex-col items-center gap-2"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white transition-transform group-hover:scale-105 group-active:scale-95 ${className}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[11px] text-white/50">{label}</span>
          </a>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={url}
            aria-label="Lien de la vidéo"
            onFocus={(e) => e.target.select()}
            className="h-11 flex-1 rounded-full border-white/10 bg-white/[0.06] px-4 font-mono text-xs text-white/60 ring-offset-transparent focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={copy}
            size={null}
            aria-label="Copier le lien"
            className={`h-11 shrink-0 gap-2 rounded-full px-5 text-sm font-semibold transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                : 'bg-white text-black hover:bg-white hover:scale-[1.03]'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copié' : 'Copier'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
