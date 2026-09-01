import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Loader2, ShieldAlert, Trash2, Check, X, RotateCcw, Ban } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
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
  const [bannedUsers, setBannedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('reports')
  const [filter, setFilter] = useState('pending')
  const [confirmVideo, setConfirmVideo] = useState(null)
  const [confirmBan, setConfirmBan] = useState(null)

  const token = () => localStorage.getItem('token')

  useEffect(() => {
    const check = async () => {
      if (!token()) { setIsAdmin(false); setChecking(false); return }
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

  const loadBanned = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/banned`, { headers: { Authorization: token() } })
      const j = await r.json()
      if (r.ok && Array.isArray(j)) setBannedUsers(j)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    if (tab === 'reports') loadReports()
    else loadBanned()
  }, [isAdmin, tab, loadReports, loadBanned])

  const unban = async (userId) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/users/${userId}/unban`, {
        method: 'POST',
        headers: { Authorization: token() },
      })
      if (!r.ok) { toast.error('Action échouée'); return }
      toast.success('Compte débanni')
      setBannedUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch { toast.error('Erreur réseau') }
  }

  const resolve = async (id, action) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token() },
        body: JSON.stringify({ action }),
      })
      if (!r.ok) { toast.error('Action échouée'); return }
      const messages = { reviewed: 'Marqué traité', dismissed: 'Ignoré', pending: 'Action annulée' }
      toast.success(messages[action] || 'Mis à jour')
      setReports((prev) => prev.filter((rep) => rep.id !== id))
    } catch { toast.error('Erreur réseau') }
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
    } catch { toast.error('Erreur réseau') }
    finally { setConfirmVideo(null) }
  }

  const banUser = async (userId) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { Authorization: token() },
      })
      const j = await r.json()
      if (!r.ok) { toast.error(j.message || 'Bannissement échoué'); return }
      toast.success('Utilisateur banni')
      setReports((prev) => prev.filter((rep) => rep.video?.userId !== userId))
    } catch { toast.error('Erreur réseau') }
    finally { setConfirmBan(null) }
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
        <h1 className="mt-3 text-[2.5rem] font-extrabold leading-[0.95] tracking-tight">
          {tab === 'reports' ? 'Signalements' : 'Comptes bannis'}
        </h1>

        <div className="mt-8 flex gap-2 border-b border-white/10">
          {[{ value: 'reports', label: 'Signalements' }, { value: 'banned', label: 'Bannis' }].map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
                tab === t.value
                  ? 'border-fuchsia-500 text-white'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'reports' && (
        <div className="mt-6 flex flex-wrap gap-2">
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
        )}

        {tab === 'reports' && (
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
                          onClick={() => setConfirmVideo(rep.video)}
                          aria-label="Supprimer la vidéo"
                          className="flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Supprimer
                        </button>
                      )}
                      {rep.video?.userId && !rep.video?.deleted && (
                        <button
                          onClick={() => setConfirmBan(rep.video)}
                          aria-label="Bannir l'auteur"
                          className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-100 transition-colors hover:bg-red-500/30"
                        >
                          <Ban className="h-3.5 w-3.5" /> Bannir
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

                  {rep.status !== 'pending' && (
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <span className="rounded-full bg-white/5 px-3 py-1.5 text-center text-xs text-white/40">
                        {rep.status === 'reviewed' ? 'Traité' : 'Ignoré'}
                      </span>
                      <button
                        onClick={() => resolve(rep.id, 'pending')}
                        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Annuler
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
        )}

        {tab === 'banned' && (
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/40">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : bannedUsers.length ? (
            bannedUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Avatar className="h-10 w-10 border border-white/10">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback className="bg-white/10 text-xs font-medium text-white/70">
                    {(u.name || u.username || u.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name || 'Sans nom'}</p>
                  <p className="truncate text-xs text-white/40">
                    {u.username ? `@${u.username}` : u.email}
                  </p>
                </div>
                <button
                  onClick={() => unban(u.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Débannir
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Check className="h-8 w-8 text-white/15" />
              <p className="text-sm text-white/40">Aucun compte banni.</p>
            </div>
          )}
        </div>
        )}
      </div>

      <AlertDialog open={!!confirmVideo} onOpenChange={(o) => { if (!o) setConfirmVideo(null) }}>
        <AlertDialogContent className="rounded-[2rem] border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight">Supprimer cette vidéo ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              « {confirmVideo?.title || 'Sans titre'} » sera définitivement supprimée, y compris chez l'hébergeur.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmVideo && deleteVideo(confirmVideo.id)}
              className="rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmBan} onOpenChange={(o) => { if (!o) setConfirmBan(null) }}>
        <AlertDialogContent className="rounded-[2rem] border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight">Bannir cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              L'auteur sera déconnecté immédiatement et ne pourra plus se connecter.
              Toutes ses vidéos seront supprimées définitivement. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmBan && banUser(confirmBan.userId)}
              className="rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              Bannir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
