import { useEffect, useState } from 'react'

const CHAMPS_KEY = 'tft-selected-champs'
const ITEMS_KEY = 'tft-selected-items'

const safeParseArray = (raw: string | null) => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function usePersistentSelections(initialChamps: string[], initialItems: string[]) {
  const [champs, setChamps] = useState<string[]>(initialChamps)
  const [items, setItems] = useState<string[]>(initialItems)

  // load from localStorage if no initial values provided
  useEffect(() => {
    if (initialChamps.length === 0) {
      const saved = safeParseArray(localStorage.getItem(CHAMPS_KEY))
      if (saved.length > 0) setChamps(saved)
    }
    if (initialItems.length === 0) {
      const savedItems = safeParseArray(localStorage.getItem(ITEMS_KEY))
      if (savedItems.length > 0) setItems(savedItems)
    }
  }, [initialChamps.length, initialItems.length])

  // persist changes
  useEffect(() => {
    localStorage.setItem(CHAMPS_KEY, JSON.stringify(champs))
  }, [champs])

  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  }, [items])

  return { champs, setChamps, items, setItems }
}

