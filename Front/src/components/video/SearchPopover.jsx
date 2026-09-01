import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Play, User } from 'lucide-react'
import { useSearch, SEARCH_MIN_CHARS } from '@/lib/hooks/useSearch'

export default function SearchPopover() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { q, setQ, results, loading } = useSearch()

  const go = (path) => {
    setOpen(false)
    setQ('')
    navigate(path)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={null}
          aria-label="Rechercher"
          className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white"
        >
          <Search className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="vibby-landing w-[calc(100vw-2rem)] max-w-sm rounded-2xl border-white/10 bg-[#0b0b10]/95 p-0 text-white backdrop-blur-2xl"
      >
        <div className="border-b border-white/10 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une vidéo ou un compte"
              className="h-11 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-sm text-white ring-offset-transparent placeholder:text-white/30 focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="flex w-full justify-around gap-2 rounded-none border-b border-white/10 bg-transparent p-0">
            <TabsTrigger
              value="videos"
              className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent bg-transparent py-2.5 text-sm text-white/40 data-[state=active]:border-fuchsia-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Play className="h-3.5 w-3.5" /> Vidéos
              {results.videos.length > 0 && <span className="text-xs text-white/30">{results.videos.length}</span>}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent bg-transparent py-2.5 text-sm text-white/40 data-[state=active]:border-fuchsia-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <User className="h-3.5 w-3.5" /> Comptes
              {results.users.length > 0 && <span className="text-xs text-white/30">{results.users.length}</span>}
            </TabsTrigger>
          </TabsList>

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" /> Recherche...
              </div>
            ) : q.trim().length < SEARCH_MIN_CHARS ? (
              <p className="py-10 text-center text-sm text-white/30">Tape au moins {SEARCH_MIN_CHARS} caractères.</p>
            ) : (
              <>
                <TabsContent value="videos" className="mt-0 space-y-1">
                  {results.videos.length ? (
                    results.videos.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => go(`/video/${v.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.06]">
                          {v.playback_id ? (
                            <img src={`https://image.mux.com/${v.playback_id}/thumbnail.jpg`} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Play className="h-4 w-4 text-white/30" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{v.title || 'Sans titre'}</span>
                          {v.username && <span className="block truncate text-xs text-white/40">@{v.username}</span>}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-white/30">Aucune vidéo.</p>
                  )}
                </TabsContent>

                <TabsContent value="users" className="mt-0 space-y-1">
                  {results.users.length ? (
                    results.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => go(u.username ? `/profile?u=${u.username}` : `/profile?id=${u.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback className="bg-white/10 text-xs text-white/70">
                            {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{u.name || u.username}</span>
                          {u.username && <span className="block truncate text-xs text-white/40">@{u.username}</span>}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-white/30">Aucun compte.</p>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        {q.trim().length >= 2 && (
          <button
            onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}
            className="w-full border-t border-white/10 py-3 text-center text-sm font-medium text-fuchsia-300 transition-colors hover:bg-white/[0.04]"
          >
            Voir tous les résultats
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
