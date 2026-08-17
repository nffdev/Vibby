import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, ShieldAlert, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { BASE_API, API_VERSION } from '../config.json'

const REASON_LABELS = {
  spam: 'Spam',
  inappropriate: 'Inapproprié',
  harassment: 'Harcèlement',
  violence: 'Violence',
  other: 'Autre',
}

const FILTERS = [
  { value: 'pending', label: 'En attente' },
  { value: 'reviewed', label: 'Traités' },
  { value: 'dismissed', label: 'Ignorés' },
  { value: 'all', label: 'Tous' },
]

export default function Admin() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('pending')

  const token = () => localStorage.getItem('token')

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/me`, { headers: { Authorization: token() } })
        const j = await r.json()
        setIsAdmin(r.ok && !!j.admin)
      } catch {
        setIsAdmin(false)
      }
      setChecking(false)
    }
    check()
  }, [])

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/reports?status=${filter}`, { headers: { Authorization: token() } })
      const j = await r.json()
      if (r.ok && Array.isArray(j)) setReports(j)
    } catch {}
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (isAdmin) loadReports()
  }, [isAdmin, loadReports])

  const resolve = async (id, action) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token() },
        body: JSON.stringify({ action }),
      })
      if (!r.ok) { toast.error('Action échouée'); return }
      toast.success(action === 'reviewed' ? 'Marqué traité' : 'Ignoré')
      setReports((prev) => prev.filter((rep) => rep.id !== id))
    } catch { toast.error('Network error') }
  }

  const deleteVideo = async (videoId) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/videos/${videoId}`, {
        method: 'DELETE',
        headers: { Authorization: token() },
      })
      if (!r.ok) { toast.error('Suppression échouée'); return }
      toast.success('Vidéo supprimée')
      setReports((prev) => prev.filter((rep) => rep.video?.id !== videoId))
    } catch { toast.error('Network error') }
  }

  if (checking) {
    return (
      <div className="vibby-landing flex min-h-screen w-full items-center justify-center bg-[#07070a] text-white">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="vibby-landing flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#07070a] px-6 text-center text-white">
        <ShieldAlert className="h-10 w-10 text-white/20" />
        <p className="text-2xl font-extrabold tracking-tight">Accès refusé</p>
        <p className="max-w-sm text-sm text-white/45">Cette page est réservée aux administrateurs.</p>
        <Button
          variant="ghost"
          size={null}
          onClick={() => navigate('/videoscreen')}
          className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.03] active:scale-95"
        >
          Retour au flux
        </Button>
      </div>
    )
  }

  return (
    <div className="vibby-landing relative min-h-screen w-full bg-[#07070a] pb-16 text-white antialiased selection:bg-fuchsia-500/30">
      <div className="mx-auto max-w-3xl px-5 pt-16">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Modération</span>
        <h1 className="mt-3 text-[2.5rem] font-extrabold leading-[0.95] tracking-tight">Signalements</h1>

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === f.value
                  ? 'border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/40">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : reports.length ? (
            reports.map((rep) => (
              <div key={rep.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-300">
                      {REASON_LABELS[rep.reason] || rep.reason}
                    </span>
                    <p className="mt-2 truncate text-sm font-medium">
                      {rep.video?.deleted ? <span className="text-white/40">Vidéo supprimée</span> : (rep.video?.title || 'Sans titre')}
                    </p>
                    {rep.detail && <p className="mt-1 text-sm text-white/50">{rep.detail}</p>}
                    <p className="mt-2 text-xs text-white/35">
                      par {rep.reporter?.username ? `@${rep.reporter.username}` : (rep.reporter?.name || 'inconnu')}
                    </p>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex shrink-0 flex-col gap-1.5">
                      {!rep.video?.deleted && (
                        <button
                          onClick={() => deleteVideo(rep.video.id)}
                          aria-label="Supprimer la vidéo"
                          className="flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Supprimer
                        </button>
                      )}
                      <button
                        onClick={() => resolve(rep.id, 'reviewed')}
                        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10"
                      >
                        <Check className="h-3.5 w-3.5" /> Traité
                      </button>
                      <button
                        onClick={() => resolve(rep.id, 'dismissed')}
                        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10"
                      >
                        <X className="h-3.5 w-3.5" /> Ignorer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Check className="h-8 w-8 text-white/15" />
              <p className="text-sm text-white/40">Aucun signalement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
