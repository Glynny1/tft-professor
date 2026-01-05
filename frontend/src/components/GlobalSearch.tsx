import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllChampions, getAllComps, getAllItems } from '../data/compHelpers'
import { trackEvent } from '../utils/analytics'

type SearchResult =
  | { type: 'comp'; id: string; name: string }
  | { type: 'champion'; id: string; name: string }
  | { type: 'item'; id: string; name: string }

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const champs = getAllChampions()
  const items = getAllItems()
  const comps = getAllComps()

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const match = (text: string) => text.toLowerCase().includes(q)
    const champMatches: SearchResult[] = champs
      .filter((c) => match(c.name) || match(c.id))
      .slice(0, 4)
      .map((c) => ({ type: 'champion', id: c.id, name: c.name }))
    const itemMatches: SearchResult[] = items
      .filter((i) => match(i.name) || match(i.id))
      .slice(0, 4)
      .map((i) => ({ type: 'item', id: i.id, name: i.name }))
    const compMatches: SearchResult[] = comps
      .filter((c) => match(c.name) || c.tags.some((t) => match(t)))
      .slice(0, 4)
      .map((c) => ({ type: 'comp', id: c.id, name: c.name }))
    return [...champMatches, ...itemMatches, ...compMatches].slice(0, 8)
  }, [champs, items, comps, query])

  useEffect(() => {
    if (!query) setIsOpen(false)
  }, [query])

  const go = (result: SearchResult) => {
    trackEvent({ name: 'global_search_select', props: { type: result.type, id: result.id } })
    if (result.type === 'comp') {
      navigate(`/comp/${result.id}`)
    } else if (result.type === 'champion') {
      navigate(`/builder?champs=${result.id}`)
    } else {
      navigate(`/builder?items=${result.id}`)
    }
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <input
        aria-label="Global search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => query && setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false)
        }}
        className="w-56 rounded-lg border border-slate/50 bg-midnight/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
        placeholder="Search comps, champs, items..."
      />
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 mt-2 w-64 rounded-lg border border-slate/50 bg-midnight/90 p-2 shadow-xl">
          <div className="space-y-1 text-sm text-slate-100">
            {results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => go(r)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-slate/40 focus:bg-slate/40 focus:outline-none"
              >
                <span className="rounded bg-slate/40 px-2 py-1 text-[11px] uppercase text-slate-300">{r.type}</span>
                <span>{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

