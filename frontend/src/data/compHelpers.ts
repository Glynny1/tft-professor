import type { Comp, Champion, Item, ScoredComp, CompRecommendation, RecommendationFilters } from '../types'
import { getCachedData } from './dataValidator'
import { getRecommendations as getDetailedRecommendations } from './recommendationEngine'

/**
 * Get all champions from cached data
 */
export function getAllChampions(): Champion[] {
  return getCachedData().champions
}

/**
 * Get all items from cached data
 */
export function getAllItems(): Item[] {
  return getCachedData().items
}

/**
 * Get all comps from cached data
 */
export function getAllComps(): Comp[] {
  return getCachedData().comps
}

/**
 * Get a single comp by ID
 */
export function getCompById(id: string): Comp | undefined {
  return getCachedData().comps.find((comp) => comp.id === id)
}

/**
 * Get champion by ID
 */
export function getChampionById(id: string): Champion | undefined {
  return getCachedData().champions.find((champ) => champ.id === id)
}

/**
 * Get item by ID
 */
export function getItemById(id: string): Item | undefined {
  return getCachedData().items.find((item) => item.id === id)
}

/**
 * Score a comp based on user's selected champions and items
 * Returns a score from 0-100
 *
 * Scoring logic:
 * - 60% weight on champion matches
 * - 40% weight on item matches
 */
export function scoreCompAgainstUserInput(
  comp: Comp,
  selectedChampIds: string[],
  selectedItemIds: string[]
): number {
  if (selectedChampIds.length === 0 && selectedItemIds.length === 0) {
    return 100 // No filters = all comps match equally
  }

  const selectedChampSet = new Set(selectedChampIds)
  const selectedItemSet = new Set(selectedItemIds)

  // Champion scoring (60% weight)
  const compChampIds = comp.units.map((u) => u.championId)
  const matchingChamps = compChampIds.filter((id) => selectedChampSet.has(id)).length
  const champScore = compChampIds.length > 0 ? (matchingChamps / compChampIds.length) * 60 : 0

  // Item scoring (40% weight)
  const compItemIds = new Set<string>()
  comp.units.forEach((unit) => {
    unit.recommendedItems.forEach((itemId) => compItemIds.add(itemId))
    unit.optionalItems?.forEach((itemId) => compItemIds.add(itemId))
  })

  const matchingItems = Array.from(compItemIds).filter((id) => selectedItemSet.has(id)).length
  const itemScore = compItemIds.size > 0 ? (matchingItems / compItemIds.size) * 40 : 0

  return Math.round(champScore + itemScore)
}

/**
 * Get recommended comps based on user's selected champions and items
 * Returns comps sorted by score (highest first)
 *
 * @param selectedChampIds - Array of selected champion IDs
 * @param selectedItemIds - Array of selected item IDs
 * @param minScore - Minimum score threshold (0-100), default 0
 * @returns Array of comps with scores and match percentages
 */
export function getRecommendedComps(
  selectedChampIds: string[],
  selectedItemIds: string[],
  minScore: number = 0
): ScoredComp[] {
  const allComps = getAllComps()

  const scoredComps: ScoredComp[] = allComps.map((comp) => {
    const score = scoreCompAgainstUserInput(comp, selectedChampIds, selectedItemIds)
    return {
      ...comp,
      score,
      matchPercentage: score
    }
  })

  // Filter by minimum score and sort descending
  return scoredComps.filter((comp) => comp.score >= minScore).sort((a, b) => b.score - a.score)
}

/**
 * Filter comps by set number
 */
export function getCompsBySet(setNumber: string): Comp[] {
  return getAllComps().filter((comp) => comp.set === setNumber)
}

/**
 * Filter comps by tags (any match)
 */
export function getCompsByTags(tags: string[]): Comp[] {
  if (tags.length === 0) return getAllComps()

  const tagSet = new Set(tags.map((t) => t.toLowerCase()))
  return getAllComps().filter((comp) => comp.tags.some((tag) => tagSet.has(tag.toLowerCase())))
}

/**
 * Search comps by name or description
 */
export function searchComps(query: string): Comp[] {
  if (!query.trim()) return getAllComps()

  const lowerQuery = query.toLowerCase()
  return getAllComps().filter(
    (comp) =>
      comp.name.toLowerCase().includes(lowerQuery) || comp.description.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get all unique tags from all comps
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  getAllComps().forEach((comp) => {
    comp.tags.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
}

/**
 * Get all unique set numbers
 */
export function getAllSets(): string[] {
  const setNumbers = new Set(getAllComps().map((comp) => comp.set))
  return Array.from(setNumbers).sort()
}

/**
 * Get detailed comp recommendations with scoring breakdown and explanations
 * This is the new, enhanced recommendation function
 */
export function getCompRecommendations(
  selectedChampIds: string[],
  selectedItemIds: string[],
  filters?: RecommendationFilters
): CompRecommendation[] {
  return getDetailedRecommendations(selectedChampIds, selectedItemIds, filters)
}

