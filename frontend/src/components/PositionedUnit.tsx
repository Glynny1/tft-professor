import type { Champion, Item } from '../types'
import { Sprite } from './Sprite'

type PositionedUnitProps = {
  champion: Champion
  items?: Item[]
  role?: string
  draggableId?: string
}

export function PositionedUnit({ champion, items = [], role, draggableId }: PositionedUnitProps) {
  return (
    <div
      className="group relative flex flex-col items-center"
      draggable={Boolean(draggableId)}
      onDragStart={(e) => {
        if (draggableId) {
          e.dataTransfer.setData('application/json', JSON.stringify({ championId: draggableId }))
        }
      }}
    >
      <div className="rounded-md border border-slate/60 bg-midnight/80 p-1 shadow-lg">
        <Sprite type="champion" id={champion.id} slug={champion.cdnSlug} size="md" />
        {role && (
          <p className="mt-1 text-center text-[10px] uppercase tracking-wide text-slate-300">
            {role}
          </p>
        )}
        {items.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {items.slice(0, 3).map((item) => (
              <Sprite key={item.id} type="item" id={item.id} slug={item.cdnSlug} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute z-20 hidden min-w-[160px] rounded-lg border border-slate/50 bg-midnight/90 p-2 text-xs text-slate-100 shadow-2xl group-hover:block">
        <p className="font-semibold">{champion.name}</p>
        {role && <p className="text-[11px] uppercase text-slate-300">{role}</p>}
        {items.length > 0 ? (
          <div className="mt-1 space-y-1">
            <p className="text-[11px] text-slate-300">Recommended items:</p>
            <div className="flex flex-wrap gap-1">
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-1 rounded bg-slate/30 px-2 py-1">
                  <Sprite type="item" id={item.id} slug={item.cdnSlug} size="sm" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">No items</p>
        )}
      </div>
    </div>
  )
}

