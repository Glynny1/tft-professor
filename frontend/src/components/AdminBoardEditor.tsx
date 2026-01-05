import { useMemo, useState } from 'react'
import type { BoardPosition, Champion, Comp, Item } from '../types'
import { BoardGrid } from './BoardGrid'
import { Sprite } from './Sprite'

type AdminBoardEditorProps = {
  comp: Comp
  champions: Champion[]
  items: Item[]
  mode?: 'json' | 'supabase'
}

export function AdminBoardEditor({ comp, champions, items, mode = 'json' }: AdminBoardEditorProps) {
  const [positions, setPositions] = useState<BoardPosition[]>(comp.positioning)
  const [selectedChampionId, setSelectedChampionId] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const champOptions = useMemo(() => {
    const ids = new Set(comp.units.map((u) => u.championId))
    return champions.filter((c) => ids.has(c.id))
  }, [champions, comp.units])

  const handlePlace = (row: number, col: number) => {
    if (!selectedChampionId) return
    // remove any existing entry for that cell
    const next = positions.filter((p) => !(p.x === col && p.y === row))
    // remove any existing entry for the same champion (to avoid duplicates)
    const withoutChampion = next.filter((p) => p.championId !== selectedChampionId)
    setPositions([...withoutChampion, { championId: selectedChampionId, x: col, y: row }])
  }

  const handleDrop = (row: number, col: number, champId: string) => {
    setSelectedChampionId(champId)
    handlePlace(row, col)
  }

  const handleClearCell = (row: number, col: number) => {
    setPositions((prev) => prev.filter((p) => !(p.x === col && p.y === row)))
  }

  const jsonOutput = useMemo(() => JSON.stringify(positions, null, 2), [positions])

  const save = () => {
    if (mode === 'json') {
      setMessage('Positions updated. Copy the JSON below into comps.json positioning.')
    } else {
      // Supabase mode would call an API route here
      setMessage('Supabase save not wired in this MVP. Implement API call here.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-200">Select unit to place:</label>
        <div className="flex flex-wrap gap-2">
          {champOptions.map((champ) => (
            <button
              key={champ.id}
              onClick={() => setSelectedChampionId(champ.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                selectedChampionId === champ.id ? 'border-accent bg-accent/20 text-white' : 'border-slate/50 bg-midnight/60 text-slate-100'
              }`}
            >
              <Sprite type="champion" id={champ.id} slug={champ.cdnSlug} size="sm" />
              <span>{champ.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSelectedChampionId('')}
          className="rounded-lg border border-slate/50 px-3 py-2 text-xs text-slate-200 hover:bg-slate/40"
        >
          Clear selection
        </button>
      </div>

      <BoardGrid
        rows={4}
        cols={7}
        positions={positions}
        champions={champions}
        items={items}
        units={comp.units}
        adminMode
        onCellClick={(row, col) => {
          if (!selectedChampionId) {
            handleClearCell(row, col)
          } else {
            handlePlace(row, col)
          }
        }}
        onDropUnit={(row, col, champId) => handleDrop(row, col, champId)}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Save positioning
        </button>
        {message && <p className="text-sm text-slate-200">{message}</p>}
      </div>

      {mode === 'json' && (
        <div className="rounded-xl border border-slate/40 bg-midnight/70 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-100">Copy positioning JSON</p>
            <button
              className="rounded border border-slate/50 px-3 py-1 text-xs text-slate-100 hover:bg-slate/40"
              onClick={() => navigator.clipboard?.writeText(jsonOutput)}
            >
              Copy
            </button>
          </div>
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/30 p-2 text-xs text-slate-200">{jsonOutput}</pre>
        </div>
      )}
    </div>
  )
}

