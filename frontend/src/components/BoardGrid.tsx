import type { BoardPosition, Champion, CompUnit, Item } from '../types'
import { BoardCell } from './BoardCell'
import { PositionedUnit } from './PositionedUnit'

type BoardGridProps = {
  rows?: number
  cols?: number
  positions: BoardPosition[]
  champions: Champion[]
  items: Item[]
  units: CompUnit[]
  adminMode?: boolean
  onCellClick?: (row: number, col: number) => void
  onDropUnit?: (row: number, col: number, championId: string) => void
  className?: string
}

const findUnit = (units: CompUnit[], champId: string) => units.find((u) => u.championId === champId)
const findChampion = (champions: Champion[], champId: string) => champions.find((c) => c.id === champId)
const findItems = (items: Item[], ids: string[] = []) => ids.map((id) => items.find((i) => i.id === id)).filter(Boolean) as Item[]

export function BoardGrid({
  rows = 4,
  cols = 7,
  positions,
  champions,
  items,
  units,
  adminMode = false,
  onCellClick,
  onDropUnit,
  className,
}: BoardGridProps) {
  // Build a lookup map for quicker access
  const gridMap = new Map<string, BoardPosition>()
  positions.forEach((pos) => {
    gridMap.set(`${pos.x}-${pos.y}`, pos)
  })

  return (
    <div className={`overflow-auto rounded-xl border border-slate/40 bg-midnight/80 p-4 ${className ?? ''}`}>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
        }}
      >
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => {
            const pos = gridMap.get(`${col}-${row}`)
            const champ = pos ? findChampion(champions, pos.championId) : undefined
            const unit = pos ? findUnit(units, pos.championId) : undefined
            const unitItems = unit ? findItems(items, unit.recommendedItems) : []
            const isOccupied = Boolean(champ)
            return (
              <BoardCell
                key={`${row}-${col}`}
                row={row}
                col={col}
                isActive={isOccupied}
                onClick={onCellClick}
                onDrop={(r, c, data) => {
                  if (!onDropUnit) return
                  const payload = data as { championId?: string }
                  if (payload?.championId) {
                    onDropUnit(r, c, payload.championId)
                  }
                }}
              >
                {champ && unit ? (
                  <PositionedUnit
                    champion={champ}
                    items={unitItems}
                    role={unit.role}
                    draggableId={adminMode ? champ.id : undefined}
                  />
                ) : adminMode ? (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-500">
                    Drop or click
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">—</span>
                )}
              </BoardCell>
            )
          }),
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Drag or click to place. Grid {cols}x{rows}.</p>
    </div>
  )
}

