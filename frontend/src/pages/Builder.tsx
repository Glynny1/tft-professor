import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllChampions, getAllItems } from '../data/compHelpers'
import { useToast } from '../components/ToastProvider'
import { Sprite } from '../components/Sprite'
import { usePersistentSelections } from '../hooks/usePersistentSelections'
import { trackEvent } from '../utils/analytics'

export default function BuilderPage() {
  const { pushToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialChamps = useMemo(() => {
    const champs = searchParams.get('champs')
    return champs ? champs.split(',').filter(Boolean) : []
  }, [searchParams])

  const initialItems = useMemo(() => {
    const items = searchParams.get('items')
    return items ? items.split(',').filter(Boolean) : []
  }, [searchParams])

  const { champs: selectedChamps, setChamps: setSelectedChamps, items: selectedItems, setItems: setSelectedItems } =
    usePersistentSelections(initialChamps, initialItems)

  const [champSearch, setChampSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const champGridRef = useRef<HTMLDivElement>(null)
  const itemGridRef = useRef<HTMLDivElement>(null)

  const champions = getAllChampions()
  const items = getAllItems()

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
    trackEvent({ name: 'builder_toggle', props: { value, type: setter === setSelectedChamps ? 'champion' : 'item' } })
  }

  const champCount = useMemo(() => selectedChamps.length, [selectedChamps])
  const itemCount = useMemo(() => selectedItems.length, [selectedItems])

  const filteredChamps = useMemo(() => {
    const q = champSearch.toLowerCase().trim()
    if (!q) return champions
    return champions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.traits.some((t) => t.toLowerCase().includes(q)),
    )
  }, [champSearch, champions])

  const filteredItems = useMemo(() => {
    const q = itemSearch.toLowerCase().trim()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
  }, [itemSearch, items])

  // keep URL synced for shareable links
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedChamps.length) params.set('champs', selectedChamps.join(','))
    if (selectedItems.length) params.set('items', selectedItems.join(','))
    setSearchParams(params, { replace: true })
  }, [selectedChamps, selectedItems, setSearchParams])

  const copyShareLink = () => {
    const url = `${window.location.origin}/results?${searchParams.toString()}`
    navigator.clipboard?.writeText(url)
    pushToast('Share link copied', 'success')
  }

  // keyboard navigation helpers
  const handleGridKey = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    total: number,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    const cols = 3
    let nextIndex = index
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = Math.min(total - 1, index + 1)
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(0, index - 1)
        break;
      case 'ArrowDown':
        nextIndex = Math.min(total - 1, index + cols)
        break;
      case 'ArrowUp':
        nextIndex = Math.max(0, index - cols)
        break;
      default:
        return
    }
    event.preventDefault()
    const el = ref.current?.querySelectorAll<HTMLButtonElement>('button[data-grid-item]')[nextIndex]
    el?.focus()
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Builder</p>
          <h2 className="text-2xl font-semibold text-white">Select champions and items</h2>
        </div>
        <Link
          to={`/results?champs=${selectedChamps.join(',')}&items=${selectedItems.join(',')}`}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          onClick={() => pushToast(`Filtering with ${champCount} champs / ${itemCount} items`, 'info')}
        >
          View results
        </Link>
        <button
          onClick={copyShareLink}
          className="rounded-lg border border-slate/50 px-3 py-2 text-xs text-slate-100 hover:bg-slate/40"
        >
          Copy share link
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate/40 bg-slate/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">Champions</h3>
            <input
              value={champSearch}
              onChange={(e) => setChampSearch(e.target.value)}
              className="w-48 rounded-lg border border-slate/50 bg-midnight/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
              placeholder="Search champions..."
            />
          </div>
          <div ref={champGridRef} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filteredChamps.map((champ, idx) => {
              const selected = selectedChamps.includes(champ.id)
              return (
                <button
                  key={champ.id}
                  data-grid-item
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selected ? 'border-accent bg-accent/20 text-white' : 'border-slate/40 bg-midnight/60 text-slate-100'
                  }`}
                  onClick={() => toggle(selectedChamps, champ.id, setSelectedChamps)}
                  onKeyDown={(e) => handleGridKey(e, idx, filteredChamps.length, champGridRef)}
                >
                  <Sprite type="champion" id={champ.id} slug={champ.cdnSlug} size="sm" />
                  <span className="flex-1">{champ.name}</span>
                  <span className="rounded bg-slate/60 px-2 py-1 text-[11px] text-slate-200">Cost {champ.cost}</span>
                </button>
              )
            })}
            {filteredChamps.length === 0 && (
              <p className="col-span-full text-sm text-slate-300">No champions match that search.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate/40 bg-slate/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">Items</h3>
            <input
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="w-48 rounded-lg border border-slate/50 bg-midnight/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-gold"
              placeholder="Search items..."
            />
          </div>
          <div ref={itemGridRef} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filteredItems.map((item, idx) => {
              const selected = selectedItems.includes(item.id)
              return (
                <button
                  key={item.id}
                  data-grid-item
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selected ? 'border-gold bg-gold/20 text-white' : 'border-slate/40 bg-midnight/60 text-slate-100'
                  }`}
                  onClick={() => toggle(selectedItems, item.id, setSelectedItems)}
                  onKeyDown={(e) => handleGridKey(e, idx, filteredItems.length, itemGridRef)}
                >
                  <Sprite type="item" id={item.id} slug={item.cdnSlug} size="sm" />
                  <span className="flex-1">{item.name}</span>
                </button>
              )
            })}
            {filteredItems.length === 0 && (
              <p className="col-span-full text-sm text-slate-300">No items match that search.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
        <span className="rounded-lg border border-slate/50 bg-slate/30 px-3 py-2">{champCount} champions selected</span>
        <span className="rounded-lg border border-slate/50 bg-slate/30 px-3 py-2">{itemCount} items selected</span>
        <button
          className="rounded-lg border border-slate/50 px-3 py-2 text-slate-100 hover:bg-slate/30"
          onClick={() => {
            setSelectedChamps([])
            setSelectedItems([])
            pushToast('Selections cleared', 'success')
          }}
        >
          Clear
        </button>
      </div>
    </section>
  )
}
