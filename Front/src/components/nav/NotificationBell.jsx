import { useEffect, useState, useCallback } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Bell, Heart, UserPlus, MessageCircle, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BASE_API, API_VERSION } from '../../config.json'

const ICONS = {
  like: { icon: Heart, className: 'text-fuchsia-400' },
  follow: { icon: UserPlus, className: 'text-violet-300' },
  comment: { icon: MessageCircle, className: 'text-sky-300' },
}

const TEXT = {
  like: 'a aimé ta vidéo',
  follow: "s'est abonné à toi",
  comment: 'a commenté ta vidéo',
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return "à l'instant"
  const m = Math.floor(s / 60)
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.floor(h / 24)
  return `il y a ${d} j`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const token = () => localStorage.getItem('token')

  const loadCount = useCallback(async () => {
    if (!token()) return
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/notifications/unread`, { headers: { Authorization: token() } })
      const j = await r.json()
      if (r.ok && typeof j.count === 'number') setCount(j.count)
    } catch {}
  }, [])

  useEffect(() => {
    loadCount()
    const interval = setInterval(loadCount, 30000)
    return () => clearInterval(interval)
  }, [loadCount])

  const loadList = useCallback(async () => {
    if (!token()) return
    setLoading(true)
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/notifications/me`, { headers: { Authorization: token() } })
      const j = await r.json()
      if (r.ok && Array.isArray(j)) setItems(j)
    } catch {}
    setLoading(false)
  }, [])

  const onOpenChange = async (next) => {
    setOpen(next)
    if (next) {
      loadList()
      if (count > 0) {
        try {
          await fetch(`${BASE_API}/v${API_VERSION}/notifications/read`, { method: 'POST', headers: { Authorization: token() } })
          setCount(0)
        } catch {}
      }
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          aria-label="Notifications"
          className="relative rounded-full p-3 text-white transition-colors hover:bg-white/10"
        >
          <Bell className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1 text-[10px] font-bold leading-none text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={12}
          collisionPadding={12}
          className="vibby-landing z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]/95 text-white shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : items.length ? (
              items.map((n) => {
                const meta = ICONS[n.type] || ICONS.like
                const Icon = meta.icon
                const name = n.actor?.username ? `@${n.actor.username}` : (n.actor?.name || 'Quelqu’un')
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04] ${n.read ? '' : 'bg-white/[0.03]'}`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarImage src={n.actor?.avatar} />
                        <AvatarFallback className="bg-white/10 text-xs text-white/70">
                          {(n.actor?.name || n.actor?.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0b0b10]">
                        <Icon className={`h-3 w-3 ${meta.className}`} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-white/80">
                        <span className="font-medium text-white">{name}</span> {TEXT[n.type] || ''}
                      </p>
                      <p className="mt-0.5 text-xs text-white/35">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-fuchsia-500" />}
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Bell className="h-8 w-8 text-white/15" />
                <p className="text-sm text-white/40">Rien pour l'instant.</p>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
