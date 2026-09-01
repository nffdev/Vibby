import { useState, useEffect, useRef } from 'react'
import { BASE_API, API_VERSION } from '../../config.json'

export const SEARCH_DEBOUNCE_MS = 350 
export const SEARCH_MIN_CHARS = 2 

export function useSearch(initialQuery = '') {
  const [q, setQ] = useState(initialQuery)
  const [results, setResults] = useState({ videos: [], users: [] })
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)

  useEffect(() => {
    const query = q.trim()

    if (query.length < SEARCH_MIN_CHARS) {
      setResults({ videos: [], users: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    const id = ++reqId.current
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/search?q=${encodeURIComponent(query)}`)
        const j = await r.json()
        if (id !== reqId.current) return
        if (r.ok) setResults({ videos: j.videos || [], users: j.users || [] })
      } catch {}
      if (id === reqId.current) setLoading(false)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [q])

  return { q, setQ, results, loading }
}
