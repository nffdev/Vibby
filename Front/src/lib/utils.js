import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_API, API_VERSION } from "../config.json"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function resolvePlaybackIds(videos) {
  const toResolve = videos.filter(v => !v.playback_id).map(v => v.id)
  if (!toResolve.length) return videos

  const resolves = await Promise.all(
    toResolve.map(async (vid) => {
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/videos/${vid}/resolve`, { headers: { 'Authorization': localStorage.getItem('token') } })
        const j = await r.json()
        if (r.ok) return j
        return null
      } catch {
        return null
      }
    })
  )

  const updates = resolves.filter(Boolean)
  if (!updates.length) return videos

  return videos.map(v => {
    const u = updates.find(x => x.id === v.id)
    return u ? { ...v, playback_id: u.playback_id } : v
  })
}
