import type { Comp, CompRecommendation, RecommendationFilters, ScoreBreakdown } from '../types'
import { SCORING_CONFIG } from './scoringConfig'
import { getAllComps, getChampionById } from './compHelpers'

/**
 * Calculate detailed score breakdown for a comp based on user's inventory
 */
export function calculateScoreBreakdown(
  comp: Comp,
  ownedChampIds: Set<string>,
  ownedItemIds: Set<string>,
): ScoreBreakdown {
  const { weights, bonuses } = SCORING_CONFIG

  // Separate core (carry) units from optional units
  const coreUnits = comp.units.filter((u) => u.role === 'carry')
  const optionalUnits = comp.units.filter((u) => u.role !== 'carry')

  // Core units score
  const coreUnitsOwned = coreUnits.filter((u) => ownedChampIds.has(u.championId)).length
  const coreUnitsScore = coreUnits.length > 0 ? (coreUnitsOwned / coreUnits.length) * weights.coreUnits : 0

  // Optional units score
  const optionalUnitsOwned = optionalUnits.filter((u) => ownedChampIds.has(u.championId)).length
  const optionalUnitsScore =
    optionalUnits.length > 0 ? (optionalUnitsOwned / optionalUnits.length) * weights.optionalUnits : 0

  // Carry items score
  const carryUnits = comp.units.filter((u) => u.role === 'carry')
  let carryItemMatches = 0
  let carryItemTotal = 0
  carryUnits.forEach((unit) => {
    const recommended = unit.recommendedItems.length
    const owned = unit.recommendedItems.filter((itemId) => ownedItemIds.has(itemId)).length
    carryItemMatches += owned
    carryItemTotal += recommended
  })
  const carryItemsScore = carryItemTotal > 0 ? (carryItemMatches / carryItemTotal) * weights.carryItems : 0

  // Support/tank items score
  const supportUnits = comp.units.filter((u) => u.role === 'tank' || u.role === 'support')
  let supportItemMatches = 0
  let supportItemTotal = 0
  supportUnits.forEach((unit) => {
    const recommended = unit.recommendedItems.length
    const owned = unit.recommendedItems.filter((itemId) => ownedItemIds.has(itemId)).length
    supportItemMatches += owned
    supportItemTotal += recommended
  })
  const supportItemsScore =
    supportItemTotal > 0 ? (supportItemMatches / supportItemTotal) * weights.supportItems : 0

  // Calculate bonuses
  const breakdown: ScoreBreakdown = {
    coreUnitsScore,
    optionalUnitsScore,
    carryItemsScore,
    supportItemsScore,
    bonuses: {},
    totalBonus: 0,
  }

  // Bonus: All core units owned
  if (coreUnits.length > 0 && coreUnitsOwned === coreUnits.length) {
    breakdown.bonuses.allCoreUnits = bonuses.allCoreUnits
    breakdown.totalBonus += bonuses.allCoreUnits
  }

  // Bonus: All carry items owned (for at least one carry)
  const hasAllCarryItems = carryUnits.some((unit) => {
    return unit.recommendedItems.every((itemId) => ownedItemIds.has(itemId))
  })
  if (hasAllCarryItems && carryUnits.length > 0) {
    breakdown.bonuses.allCarryItems = bonuses.allCarryItems
    breakdown.totalBonus += bonuses.allCarryItems
  }

  // Bonus: Cost efficiency (comps with low-cost units are easier to build)
  const avgCost =
    comp.units.reduce((sum, unit) => {
      const champ = getChampionById(unit.championId)
      return sum + (champ?.cost ?? 3)
    }, 0) / comp.units.length

  if (avgCost <= 2.5) {
    breakdown.bonuses.costEfficiency = bonuses.costEfficiency
    breakdown.totalBonus += bonuses.costEfficiency
  }

  return breakdown
}

/**
 * Generate human-readable explanation for why a comp was recommended
 */
export function generateExplanation(
  comp: Comp,
  breakdown: ScoreBreakdown,
  ownedChampIds: Set<string>,
  ownedItemIds: Set<string>,
): string {
  const reasons: string[] = []

  // Core units
  const coreUnits = comp.units.filter((u) => u.role === 'carry')
  const coreUnitsOwned = coreUnits.filter((u) => ownedChampIds.has(u.championId)).length
  if (coreUnitsOwned === coreUnits.length && coreUnits.length > 0) {
    reasons.push(`You own all ${coreUnits.length} core units`)
  } else if (coreUnitsOwned > 0) {
    reasons.push(`You own ${coreUnitsOwned}/${coreUnits.length} core units`)
  }

  // Carry items
  const carryUnits = comp.units.filter((u) => u.role === 'carry')
  const carryWithAllItems = carryUnits.filter((unit) =>
    unit.recommendedItems.every((itemId) => ownedItemIds.has(itemId)),
  )
  if (carryWithAllItems.length > 0) {
    reasons.push(`Perfect items for ${carryWithAllItems[0].championId}`)
  } else {
    const carryItemCount = carryUnits.reduce(
      (sum, unit) => sum + unit.recommendedItems.filter((itemId) => ownedItemIds.has(itemId)).length,
      0,
    )
    const totalCarryItems = carryUnits.reduce((sum, unit) => sum + unit.recommendedItems.length, 0)
    if (carryItemCount > 0) {
      reasons.push(`${carryItemCount}/${totalCarryItems} key items available`)
    }
  }

  // Bonuses
  if (breakdown.bonuses.costEfficiency) {
    reasons.push('Low-cost units (easy to build)')
  }

  // Fallback
  if (reasons.length === 0) {
    const totalUnitsOwned = comp.units.filter((u) => ownedChampIds.has(u.championId)).length
    reasons.push(`${totalUnitsOwned}/${comp.units.length} units available`)
  }

  return reasons.slice(0, 3).join(' • ')
}

/**
 * Calculate total score and generate full recommendation
 */
export function scoreComp(
  comp: Comp,
  ownedChampIds: Set<string>,
  ownedItemIds: Set<string>,
): CompRecommendation {
  const breakdown = calculateScoreBreakdown(comp, ownedChampIds, ownedItemIds)

  const baseScore =
    breakdown.coreUnitsScore +
    breakdown.optionalUnitsScore +
    breakdown.carryItemsScore +
    breakdown.supportItemsScore

  const totalScore = Math.min(baseScore + breakdown.totalBonus, 100)

  // Determine confidence level
  let confidence: CompRecommendation['confidence']
  if (totalScore >= SCORING_CONFIG.thresholds.perfectMatch) {
    confidence = 'perfect'
  } else if (totalScore >= SCORING_CONFIG.thresholds.highConfidence) {
    confidence = 'high'
  } else if (totalScore >= SCORING_CONFIG.thresholds.minRecommendScore) {
    confidence = 'medium'
  } else {
    confidence = 'low'
  }

  // Calculate missing units/items
  const missingUnits = comp.units.filter((u) => !ownedChampIds.has(u.championId)).map((u) => u.championId)

  const allRequiredItems = new Set<string>()
  comp.units.forEach((u) => u.recommendedItems.forEach((itemId) => allRequiredItems.add(itemId)))
  const missingItems = Array.from(allRequiredItems).filter((itemId) => !ownedItemIds.has(itemId))

  const explanation = generateExplanation(comp, breakdown, ownedChampIds, ownedItemIds)

  return {
    ...comp,
    score: Math.round(totalScore),
    matchPercentage: Math.round(totalScore),
    breakdown,
    explanation,
    confidence,
    missingUnits,
    missingItems,
  }
}

/**
 * Get recommended comps with detailed scoring and filtering
 */
export function getRecommendations(
  ownedChampIds: string[],
  ownedItemIds: string[],
  filters: RecommendationFilters = {},
): CompRecommendation[] {
  const ownedChampSet = new Set(ownedChampIds)
  const ownedItemSet = new Set(ownedItemIds)

  let comps = getAllComps()

  // Apply set filter
  if (filters.sets && filters.sets.length > 0) {
    comps = comps.filter((comp) => filters.sets!.includes(comp.set))
  }

  // Apply tag filter
  if (filters.tags && filters.tags.length > 0) {
    comps = comps.filter((comp) => comp.tags.some((tag) => filters.tags!.includes(tag)))
  }

  // Score all comps
  let recommendations = comps.map((comp) => scoreComp(comp, ownedChampSet, ownedItemSet))

  // Apply minimum score filter
  const minScore = filters.minScore ?? SCORING_CONFIG.thresholds.minRecommendScore
  recommendations = recommendations.filter((rec) => rec.score >= minScore)

  // Apply owned units only filter
  if (filters.ownedUnitsOnly) {
    recommendations = recommendations.filter((rec) => rec.missingUnits.length === 0)
  }

  // Sort by score (descending)
  recommendations.sort((a, b) => b.score - a.score)

  // Apply max results limit
  if (filters.maxResults && filters.maxResults > 0) {
    recommendations = recommendations.slice(0, filters.maxResults)
  }

  return recommendations
}

