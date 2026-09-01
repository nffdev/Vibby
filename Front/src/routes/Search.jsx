import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import VideoGrid from '@/components/video/VideoGrid'
import BottomNav from '@/components/nav/BottomNav'
import { ArrowLeft, Search as SearchIcon, Loader2, User, Play } from 'lucide-react'
import { useSearch, SEARCH_MIN_CHARS } from '@/lib/hooks/useSearch'

export default function Search() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { q, setQ, results, loading } = useSearch(searchParams.get('q') || '')

  useEffect(() => {
    const query = q.trim()
    setSearchParams(query ? { q: query } : {}, { replace: true })
  }, [q, setSearchParams])

  const gridVideos = results.videos.map((v) => ({
    ...v,
    views: 0,
    thumbnail: v.playback_id
      ? `https://image.mux.com/${v.playback_id}/thumbnail.jpg`
      : `/placeholder.svg?text=${encodeURIComponent(v.title || 'Video')}`,
  }))

  return (
    <div className="vibby-landing relative min-h-screen w-full bg-[#07070a] pb-28 text-white antialiased selection:bg-fuchsia-500/30">
      <div className="mx-auto max-w-3xl px-5 pt-16">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Explorer</span>
        <h1 className="mt-3 text-[2.5rem] font-extrabold leading-[0.95] tracking-tight">Recherche</h1>

        <div className="relative mt-8">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une vidéo ou un compte"
            className="h-14 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-sm text-white ring-offset-transparent placeholder:text-white/30 focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Tabs defaultValue="videos" className="mt-8 w-full">
          <TabsList className="flex w-full justify-around gap-2 border-b border-white/10 bg-transparent p-0">
            <TabsTrigger
              value="videos"
              className="flex-1 gap-2 rounded-none border-b-2 border-transparent bg-transparent py-3 text-white/40 data-[state=active]:border-fuchsia-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Play className="h-4 w-4" /> Vidéos
              {results.videos.length > 0 && <span className="text-xs text-white/30">{results.videos.length}</span>}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex-1 gap-2 rounded-none border-b-2 border-transparent bg-transparent py-3 text-white/40 data-[state=active]:border-fuchsia-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <User className="h-4 w-4" /> Comptes
              {results.users.length > 0 && <span className="text-xs text-white/30">{results.users.length}</span>}
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-white/40">
              <Loader2 className="h-4 w-4 animate-spin" /> Recherche...
            </div>
          ) : q.trim().length < SEARCH_MIN_CHARS ? (
            <p className="py-20 text-center text-sm text-white/30">Tape au moins {SEARCH_MIN_CHARS} caractères pour lancer la recherche.</p>
          ) : (
            <>
              <TabsContent value="videos">
                {gridVideos.length ? (
                  <VideoGrid videos={gridVideos} onSelect={(id) => navigate(`/video/${id}`)} isOwner={false} />
                ) : (
                  <p className="py-20 text-center text-sm text-white/40">Aucune vidéo trouvée.</p>
                )}
              </TabsContent>

              <TabsContent value="users" className="space-y-2 py-4">
                {results.users.length ? (
                  results.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => navigate(u.username ? `/profile?u=${u.username}` : `/profile?id=${u.id}`)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <Avatar className="h-11 w-11 border border-white/10">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-white/10 text-sm text-white/70">
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
                  <p className="py-20 text-center text-sm text-white/40">Aucun compte trouvé.</p>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}
