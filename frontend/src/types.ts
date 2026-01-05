// Core types for TFT Professor

export type Champion = {
  id: string
  name: string
  cost: number
  traits: string[]
  /**
   * Optional explicit CDN slug (e.g., "tft13_ahri").
   * If omitted, we derive from id.
   */
  cdnSlug?: string
}

export type Item = {
  id: string
  name: string
  /**
   * Optional explicit CDN slug (e.g., "standard/Infinity_Edge.png").
   * If omitted, we derive from id.
   */
  cdnSlug?: string
}

export type UnitRole = 'carry' | 'tank' | 'support' | 'flex'

export type CompUnit = {
  championId: string
  role: UnitRole
  recommendedItems: string[] // item IDs
  optionalItems?: string[] // item IDs
}

export type BoardPosition = {
  championId: string
  x: number // 0-6 (7 columns)
  y: number // 0-3 (4 rows)
}

export type Comp = {
  id: string
  name: string
  set: string // e.g., "16"
  patch: string // e.g., "14.24"
  description: string
  tags: string[] // e.g., ["Reroll", "AP", "Late Game"]
  units: CompUnit[]
  positioning: BoardPosition[]
}

// Detailed scoring breakdown
export type ScoreBreakdown = {
  coreUnitsScore: number // Score from matching core units
  optionalUnitsScore: number // Score from matching optional units
  carryItemsScore: number // Score from matching carry items
  supportItemsScore: number // Score from matching support/tank items
  bonuses: {
    allCoreUnits?: number
    allCarryItems?: number
    costEfficiency?: number
  }
  totalBonus: number
}

// Recommendation with full details
export type CompRecommendation = Comp & {
  score: number // Final score (0-100+)
  matchPercentage: number // Percentage match for display
  breakdown: ScoreBreakdown
  explanation: string // Human-readable explanation
  confidence: 'low' | 'medium' | 'high' | 'perfect' // Confidence level
  missingUnits: string[] // Champion IDs user doesn't own
  missingItems: string[] // Item IDs user doesn't own
}

// Filtering options for recommendations
export type RecommendationFilters = {
  minScore?: number // Minimum score threshold
  ownedUnitsOnly?: boolean // Only show comps where user owns all units
  maxResults?: number // Limit number of results
  sets?: string[] // Filter by set numbers
  tags?: string[] // Filter by comp tags
}

// Helper type for scored comps (backward compatibility)
export type ScoredComp = Comp & {
  score: number
  matchPercentage: number
}
