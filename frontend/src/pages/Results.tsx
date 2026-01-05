import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCompRecommendations, getChampionById, getItemById } from '../data/compHelpers'
import { Sprite } from '../components/Sprite'
import { trackEvent } from '../utils/analytics'

export default function ResultsPage() {
  const [searchParams] = useSearchParams()
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [minScore, setMinScore] = useState(30)
  const [copied, setCopied] = useState(false)

  // Parse URL query params for selected champs/items
  const selectedChamps = useMemo(() => {
    const champs = searchParams.get('champs')
    return champs ? champs.split(',').filter(Boolean) : []
  }, [searchParams])

  const selectedItems = useMemo(() => {
    const items = searchParams.get('items')
    return items ? items.split(',').filter(Boolean) : []
  }, [searchParams])

  // Get recommended comps with detailed scoring
  const recommendations = useMemo(() => {
    const recs = getCompRecommendations(selectedChamps, selectedItems, {
      minScore,
      ownedUnitsOnly: showOnlyOwned,
    })
    trackEvent({ name: 'results_view', props: { recs: recs.length, minScore, ownedUnitsOnly: showOnlyOwned } })
    return recs
  }, [selectedChamps, selectedItems, minScore, showOnlyOwned])

  const confidenceColors = {
    perfect: 'bg-green-500/20 text-green-400 border-green-500/50',
    high: 'bg-accent/20 text-accent border-accent/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-slate/20 text-slate-300 border-slate/50',
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Results</p>
          <h2 className="text-2xl font-semibold text-white">Recommended comps</h2>
          {(selectedChamps.length > 0 || selectedItems.length > 0) && (
            <p className="text-sm text-slate-300">
              Filtered by {selectedChamps.length} champions, {selectedItems.length} items
            </p>
          )}
        </div>
        <Link to="/builder" className="rounded-lg border border-slate/50 px-3 py-2 text-sm text-slate-100 hover:bg-slate/30">
          Adjust filters
        </Link>
        <button
          onClick={() => {
            const url = `${window.location.origin}/results?${searchParams.toString()}`
            navigator.clipboard?.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="rounded-lg border border-slate/50 px-3 py-2 text-sm text-slate-100 hover:bg-slate/30"
        >
          {copied ? 'Link copied' : 'Copy share link'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate/40 bg-slate/30 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-200">Min Score:</label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-semibold text-white">{minScore}%</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ownedOnly"
            checked={showOnlyOwned}
            onChange={(e) => setShowOnlyOwned(e.target.checked)}
            className="h-4 w-4 rounded border-slate/50"
          />
          <label htmlFor="ownedOnly" className="text-sm text-slate-200">
            Owned units only
          </label>
        </div>

        <div className="ml-auto text-sm text-slate-300">{recommendations.length} comps found</div>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-xl border border-slate/40 bg-slate/30 p-8 text-center">
          <p className="text-lg text-slate-200">No comps match your filters</p>
          <p className="mt-2 text-sm text-slate-300">
            Try lowering the minimum score or selecting different champions/items
          </p>
          <Link
            to="/builder"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Go to Builder
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((comp) => (
            <div key={comp.id} className="rounded-xl border border-slate/40 bg-slate/30 p-4 shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {comp.tags.includes('S-Tier')
                        ? 'S'
                        : comp.tags.includes('A-Tier')
                          ? 'A'
                          : comp.tags.includes('B-Tier')
                            ? 'B'
                            : 'C'}
                    </p>
                    <span className="rounded-full bg-accent/20 px-2 py-1 text-xs font-semibold text-accent">
                      {comp.matchPercentage}% match
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${confidenceColors[comp.confidence]}`}
                    >
                      {comp.confidence}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{comp.name}</h3>
                  <p className="text-sm text-slate-200">{comp.description}</p>

                  {/* Explanation */}
                  <div className="mt-2 rounded-lg border border-accent/30 bg-accent/10 p-2">
                    <p className="text-xs font-semibold text-accent">Why recommended:</p>
                    <p className="text-xs text-slate-200">{comp.explanation}</p>
                  </div>
                </div>
                <Link
                  to={`/comp/${comp.id}`}
                  className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:brightness-110"
                >
                  View
                </Link>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                {comp.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate/40 px-3 py-1 text-[11px] uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Core units */}
              <div className="mt-3 text-sm text-slate-200">
                <p className="font-semibold text-slate-100">Core units</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {comp.units
                    .filter((u) => u.role === 'carry')
                    .map((unit) => {
                      const champ = getChampionById(unit.championId)
                      const isOwned = selectedChamps.includes(unit.championId)
                      return (
                        <div
                          key={unit.championId}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                            isOwned ? 'bg-accent/20 border border-accent/50' : 'bg-midnight/60'
                          }`}
                        >
                          <Sprite type="champion" id={unit.championId} slug={champ?.cdnSlug} size="sm" />
                          <span className="text-xs text-slate-100">{champ?.name ?? unit.championId}</span>
                          {isOwned && <span className="text-[10px] text-accent">✓</span>}
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Key items */}
              <div className="mt-3 text-sm text-slate-200">
                <p className="font-semibold text-slate-100">Key items</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {Array.from(
                    new Set(
                      comp.units
                        .filter((u) => u.role === 'carry')
                        .flatMap((u) => u.recommendedItems)
                        .filter(Boolean),
                    ),
                  )
                    .slice(0, 6)
                    .map((itemId) => {
                      const item = getItemById(itemId)
                      const isOwned = selectedItems.includes(itemId)
                      return (
                        <div
                          key={itemId}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                            isOwned ? 'bg-gold/20 border border-gold/50' : 'bg-slate/40'
                          }`}
                        >
                          <Sprite type="item" id={itemId} slug={item?.cdnSlug} size="sm" />
                          <span className="text-xs text-slate-100">{item?.name ?? itemId}</span>
                          {isOwned && <span className="text-[10px] text-gold">✓</span>}
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Score breakdown (expandable) */}
              <details className="mt-3 cursor-pointer">
                <summary className="text-xs font-semibold text-slate-300">Score breakdown</summary>
                <div className="mt-2 space-y-1 rounded-lg bg-midnight/60 p-2 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Core units:</span>
                    <span className="font-semibold text-white">{Math.round(comp.breakdown.coreUnitsScore)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optional units:</span>
                    <span className="font-semibold text-white">{Math.round(comp.breakdown.optionalUnitsScore)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carry items:</span>
                    <span className="font-semibold text-white">{Math.round(comp.breakdown.carryItemsScore)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support items:</span>
                    <span className="font-semibold text-white">{Math.round(comp.breakdown.supportItemsScore)}</span>
                  </div>
                  {comp.breakdown.totalBonus > 0 && (
                    <div className="flex justify-between border-t border-slate/40 pt-1">
                      <span>Bonuses:</span>
                      <span className="font-semibold text-accent">+{Math.round(comp.breakdown.totalBonus)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate/40 pt-1 font-bold">
                    <span>Total:</span>
                    <span className="text-white">{comp.score}</span>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
