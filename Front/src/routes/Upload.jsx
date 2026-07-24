import useSWR from 'swr';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from "@/components/nav/BottomNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { BASE_API, API_VERSION } from "../config.json"
import MuxUploader from "@mux/mux-uploader-react";

export default function UploadPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadCompleted, setUploadCompleted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetcher = (url) => fetch(`${BASE_API}/v${API_VERSION}${url}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } }).then(response => response.json());
  const { data, isLoading } = useSWR('/uploads', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const manageSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Title is required.')
    if (!description.trim()) return setError('Description is required.')
    if (!data?.id) return setError('Upload URL unavailable at the moment. Please try again later.')
    if (!uploadCompleted) return setError('Upload the video first.')

    setIsSubmitting(true)
    try {
      const response = await fetch(`${BASE_API}/v${API_VERSION}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ upload_id: data.id, title: title.trim(), description: description.trim() })
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.message || 'An error occurred.')
      } else {
        navigate(-1)
      }
    } catch {
      setError('Impossible to upload the video at the moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="vibby-landing relative min-h-screen w-full bg-[#07070a] pb-28 text-white antialiased selection:bg-fuchsia-500/30">
      <div className="absolute top-3 sm:top-5 left-3 sm:left-5 z-20">
        <Button
          variant="ghost"
          size={null}
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="mx-auto max-w-lg px-5 pt-24">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Nouvelle vidéo</span>
        <h1 className="mt-3 text-[2.5rem] font-extrabold leading-[0.95] tracking-tight">
          Poste
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
            ta boucle.
          </span>
        </h1>

        <form onSubmit={manageSubmit} className="mt-10 space-y-4">
          <div className="vibby-uploader rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 transition-colors hover:border-white/25">
            <MuxUploader
              endpoint={data?.url || ''}
              onSuccess={() => setUploadCompleted(true)}
              onUploadError={() => setError('Failed to upload the video.')}
            />
            {uploadCompleted && (
              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                <Check className="h-4 w-4" />
                Vidéo envoyée
              </div>
            )}
          </div>

          <Input
            type="text"
            placeholder="Titre de la vidéo"
            aria-label="Titre de la vidéo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-14 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-sm text-white ring-offset-transparent backdrop-blur-md placeholder:text-white/30 focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <Textarea
            placeholder="Décris-la en deux mots"
            aria-label="Description de la vidéo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white ring-offset-transparent backdrop-blur-md placeholder:text-white/30 focus-visible:border-fuchsia-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {error && (
            <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="ghost"
            size={null}
            disabled={isSubmitting || isLoading}
            className="w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:bg-white hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publier'}
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
