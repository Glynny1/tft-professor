/**
 * Scoring configuration for comp recommendations
 * All weights should sum to 100 for percentage-based scoring
 */
export const SCORING_CONFIG = {
  weights: {
    coreUnits: 50, // Weight for matching core/carry units (50%)
    optionalUnits: 15, // Weight for matching optional/flex units (15%)
    carryItems: 25, // Weight for matching items on carry units (25%)
    supportItems: 10, // Weight for matching items on support/tank units (10%)
  },
  thresholds: {
    minRecommendScore: 30, // Minimum score to recommend a comp (30%)
    highConfidence: 70, // Score above which we consider it a "strong" recommendation
    perfectMatch: 95, // Near-perfect match threshold
  },
  bonuses: {
    allCoreUnits: 10, // Bonus if user owns ALL core units
    allCarryItems: 8, // Bonus if user owns ALL items for a carry
    costEfficiency: 5, // Bonus for low-cost comps (easier to build)
  },
} as const

export type ScoringConfig = typeof SCORING_CONFIG

