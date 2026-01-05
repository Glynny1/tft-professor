import { Link, useParams } from 'react-router-dom'
import { getCompById, getChampionById, getItemById, getAllChampions, getAllItems } from '../data/compHelpers'
import { Sprite } from '../components/Sprite'
import { BoardGrid } from '../components/BoardGrid'

export default function CompDetailPage() {
  const { id } = useParams<{ id: string }>()
  const comp = id ? getCompById(id) : undefined
  const champions = getAllChampions()
  const items = getAllItems()

  if (!comp) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
        <p className="text-lg font-semibold">Comp not found</p>
        <Link to="/results" className="mt-3 inline-block text-sm text-red-50 underline">
          Back to results
        </Link>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Set {comp.set} • Patch {comp.patch}
          </p>
          <h2 className="text-3xl font-bold text-white">{comp.name}</h2>
          <p className="text-slate-200">{comp.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
            {comp.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate/40 px-3 py-1 text-[11px] uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          to="/results"
          className="rounded-lg border border-slate/50 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate/30"
        >
          Back
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Board positioning */}
        <BoardGrid positions={comp.positioning} champions={champions} items={items} units={comp.units} rows={4} cols={7} />

        {/* Units & items */}
        <div className="rounded-xl border border-slate/40 bg-slate/30 p-4">
          <p className="text-sm font-semibold text-slate-100">Units & items</p>
          <div className="mt-3 space-y-3">
            {comp.units.map((unit) => {
              const champ = getChampionById(unit.championId)
              const position = comp.positioning.find((p) => p.championId === unit.championId)

              return (
                <div key={unit.championId} className="rounded-lg border border-slate/40 bg-midnight/60 p-3">
                  <div className="flex items-center gap-2">
                    <Sprite type="champion" id={unit.championId} slug={champ?.cdnSlug} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {champ?.name ?? unit.championId}{' '}
                        <span className="ml-2 rounded bg-slate/40 px-2 py-1 text-[11px] uppercase text-slate-200">
                          {unit.role}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {champ?.traits.join(', ')} • Cost {champ?.cost}
                      </p>
                    </div>
                  </div>

                  {unit.recommendedItems.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-slate-200">Recommended items:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {unit.recommendedItems.map((itemId) => {
                          const item = getItemById(itemId)
                          return (
                            <div
                              key={itemId}
                              className="flex items-center gap-2 rounded bg-slate/40 px-2 py-1 text-[11px] text-slate-100"
                            >
                              <Sprite type="item" id={itemId} slug={item?.cdnSlug} size="sm" />
                              {item?.name ?? itemId}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {unit.optionalItems && unit.optionalItems.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-slate-200">Optional items:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {unit.optionalItems.map((itemId) => {
                          const item = getItemById(itemId)
                          return (
                            <div
                              key={itemId}
                              className="flex items-center gap-2 rounded bg-slate/60 px-2 py-1 text-[11px] text-slate-300"
                            >
                              <Sprite type="item" id={itemId} slug={item?.cdnSlug} size="sm" />
                              {item?.name ?? itemId}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {position && (
                    <p className="mt-2 text-xs text-slate-400">
                      Position: Row {position.y + 1}, Col {position.x + 1}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
