import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Comp } from '../types'
import { calculateScoreBreakdown, generateExplanation, scoreComp, getRecommendations } from './recommendationEngine'
import { SCORING_CONFIG } from './scoringConfig'
import * as compHelpers from './compHelpers'

// Mock data
const mockChampions = [
  { id: 'ahri', name: 'Ahri', cost: 4, traits: ['Mage', 'Mythic'], cdnSlug: 'tft13_ahri' },
  { id: 'ornn', name: 'Ornn', cost: 5, traits: ['Blacksmith', 'Elder'], cdnSlug: 'tft13_ornn' },
  { id: 'sett', name: 'Sett', cost: 1, traits: ['Bruiser', 'Fortune'], cdnSlug: 'tft13_sett' },
  { id: 'garen', name: 'Garen', cost: 1, traits: ['Warden', 'Warrior'], cdnSlug: 'tft13_garen' },
]

const mockComp: Comp = {
  id: 'comp-test-1',
  name: 'Test Mythic Comp',
  set: '16',
  patch: '14.24',
  description: 'Test comp for scoring',
  tags: ['AP', 'Mythic', 'Late Game'],
  units: [
    {
      championId: 'ahri',
      role: 'carry',
      recommendedItems: ['rabadons', 'morellonomicon', 'hextech_gunblade'],
      optionalItems: [],
    },
    {
      championId: 'ornn',
      role: 'tank',
      recommendedItems: ['bramble_vest', 'titans_resolve'],
      optionalItems: [],
    },
    {
      championId: 'sett',
      role: 'tank',
      recommendedItems: ['bramble_vest'],
      optionalItems: [],
    },
    {
      championId: 'garen',
      role: 'support',
      recommendedItems: [],
      optionalItems: [],
    },
  ],
  positioning: [
    { championId: 'ahri', x: 3, y: 2 },
    { championId: 'ornn', x: 3, y: 0 },
    { championId: 'sett', x: 1, y: 0 },
    { championId: 'garen', x: 5, y: 0 },
  ],
}

const mockLowCostComp: Comp = {
  id: 'comp-test-2',
  name: 'Low Cost Reroll',
  set: '16',
  patch: '14.24',
  description: 'Low cost comp',
  tags: ['Reroll', 'Early Game'],
  units: [
    {
      championId: 'sett',
      role: 'carry',
      recommendedItems: ['bramble_vest', 'titans_resolve'],
      optionalItems: [],
    },
    {
      championId: 'garen',
      role: 'tank',
      recommendedItems: ['bramble_vest'],
      optionalItems: [],
    },
  ],
  positioning: [
    { championId: 'sett', x: 2, y: 0 },
    { championId: 'garen', x: 4, y: 0 },
  ],
}

describe('recommendationEngine', () => {
  beforeEach(() => {
    // Mock getChampionById
    vi.spyOn(compHelpers, 'getChampionById').mockImplementation((id: string) => {
      return mockChampions.find((c) => c.id === id)
    })

    // Mock getAllComps
    vi.spyOn(compHelpers, 'getAllComps').mockReturnValue([mockComp, mockLowCostComp])
  })

  describe('calculateScoreBreakdown', () => {
    it('should return zero scores when user owns nothing', () => {
      const ownedChamps = new Set<string>()
      const ownedItems = new Set<string>()

      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      expect(breakdown.coreUnitsScore).toBe(0)
      expect(breakdown.optionalUnitsScore).toBe(0)
      expect(breakdown.carryItemsScore).toBe(0)
      expect(breakdown.supportItemsScore).toBe(0)
      expect(breakdown.totalBonus).toBe(0)
    })

    it('should score 100% when user owns all units and items', () => {
      const ownedChamps = new Set(['ahri', 'ornn', 'sett', 'garen'])
      const ownedItems = new Set(['rabadons', 'morellonomicon', 'hextech_gunblade', 'bramble_vest', 'titans_resolve'])

      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      // Core units: 1/1 carry (ahri) = 100% of 50 weight = 50
      expect(breakdown.coreUnitsScore).toBe(SCORING_CONFIG.weights.coreUnits)

      // Optional units: 3/3 (ornn, sett, garen) = 100% of 15 weight = 15
      expect(breakdown.optionalUnitsScore).toBe(SCORING_CONFIG.weights.optionalUnits)

      // Carry items: 3/3 for ahri = 100% of 25 weight = 25
      expect(breakdown.carryItemsScore).toBe(SCORING_CONFIG.weights.carryItems)

      // Support items: 3/3 total = 100% of 10 weight = 10
      expect(breakdown.supportItemsScore).toBe(SCORING_CONFIG.weights.supportItems)

      // Total base score = 50 + 15 + 25 + 10 = 100
    })

    it('should give bonus for owning all core units', () => {
      const ownedChamps = new Set(['ahri']) // Only the carry
      const ownedItems = new Set<string>()

      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      expect(breakdown.bonuses.allCoreUnits).toBe(SCORING_CONFIG.bonuses.allCoreUnits)
      expect(breakdown.totalBonus).toBe(SCORING_CONFIG.bonuses.allCoreUnits)
    })

    it('should give bonus for owning all carry items', () => {
      const ownedChamps = new Set<string>()
      const ownedItems = new Set(['rabadons', 'morellonomicon', 'hextech_gunblade'])

      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      expect(breakdown.bonuses.allCarryItems).toBe(SCORING_CONFIG.bonuses.allCarryItems)
      expect(breakdown.totalBonus).toBeGreaterThanOrEqual(SCORING_CONFIG.bonuses.allCarryItems)
    })

    it('should give bonus for low-cost comps', () => {
      const ownedChamps = new Set<string>()
      const ownedItems = new Set<string>()

      const breakdown = calculateScoreBreakdown(mockLowCostComp, ownedChamps, ownedItems)

      // Low cost comp (sett=1, garen=1, avg=1) should get cost efficiency bonus
      expect(breakdown.bonuses.costEfficiency).toBe(SCORING_CONFIG.bonuses.costEfficiency)
    })

    it('should correctly score partial matches', () => {
      // User owns 1/1 carry, 1/3 optional units, 1/3 carry items, 0 support items
      const ownedChamps = new Set(['ahri', 'sett']) // carry + 1 optional
      const ownedItems = new Set(['rabadons']) // 1/3 carry items

      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      // Core units: 1/1 = 100% * 50 = 50
      expect(breakdown.coreUnitsScore).toBe(50)

      // Optional units: 1/3 ≈ 33% * 15 = 5
      expect(breakdown.optionalUnitsScore).toBeCloseTo(5, 0)

      // Carry items: 1/3 ≈ 33% * 25 ≈ 8.33
      expect(breakdown.carryItemsScore).toBeCloseTo(8.33, 1)

      // Support items: 0/3 = 0
      expect(breakdown.supportItemsScore).toBe(0)
    })
  })

  describe('generateExplanation', () => {
    it('should explain when user owns all core units', () => {
      const ownedChamps = new Set(['ahri'])
      const ownedItems = new Set<string>()
      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      const explanation = generateExplanation(mockComp, breakdown, ownedChamps, ownedItems)

      expect(explanation).toContain('You own all 1 core units')
    })

    it('should explain when user has perfect items for carry', () => {
      const ownedChamps = new Set<string>()
      const ownedItems = new Set(['rabadons', 'morellonomicon', 'hextech_gunblade'])
      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      const explanation = generateExplanation(mockComp, breakdown, ownedChamps, ownedItems)

      expect(explanation).toContain('Perfect items for ahri')
    })

    it('should explain partial item matches', () => {
      const ownedChamps = new Set<string>()
      const ownedItems = new Set(['rabadons']) // 1/3 carry items
      const breakdown = calculateScoreBreakdown(mockComp, ownedChamps, ownedItems)

      const explanation = generateExplanation(mockComp, breakdown, ownedChamps, ownedItems)

      expect(explanation).toContain('1/3 key items')
    })

    it('should mention cost efficiency bonus', () => {
      const ownedChamps = new Set(['sett'])
      const ownedItems = new Set<string>()
      const breakdown = calculateScoreBreakdown(mockLowCostComp, ownedChamps, ownedItems)

      const explanation = generateExplanation(mockLowCostComp, breakdown, ownedChamps, ownedItems)

      expect(explanation).toContain('Low-cost units')
    })
  })

  describe('scoreComp', () => {
    it('should return a complete CompRecommendation object', () => {
      const ownedChamps = new Set(['ahri', 'ornn'])
      const ownedItems = new Set(['rabadons', 'morellonomicon'])

      const recommendation = scoreComp(mockComp, ownedChamps, ownedItems)

      expect(recommendation).toHaveProperty('score')
      expect(recommendation).toHaveProperty('matchPercentage')
      expect(recommendation).toHaveProperty('breakdown')
      expect(recommendation).toHaveProperty('explanation')
      expect(recommendation).toHaveProperty('confidence')
      expect(recommendation).toHaveProperty('missingUnits')
      expect(recommendation).toHaveProperty('missingItems')
    })

    it('should assign correct confidence levels', () => {
      // Perfect match
      const ownedAll = new Set(['ahri', 'ornn', 'sett', 'garen'])
      const itemsAll = new Set(['rabadons', 'morellonomicon', 'hextech_gunblade', 'bramble_vest', 'titans_resolve'])
      const perfect = scoreComp(mockComp, ownedAll, itemsAll)
      expect(perfect.confidence).toBe('perfect')
      expect(perfect.score).toBeGreaterThanOrEqual(SCORING_CONFIG.thresholds.perfectMatch)

      // No match
      const ownedNone = new Set<string>()
      const itemsNone = new Set<string>()
      const none = scoreComp(mockComp, ownedNone, itemsNone)
      expect(none.confidence).toBe('low')
      expect(none.score).toBeLessThan(SCORING_CONFIG.thresholds.minRecommendScore)
    })

    it('should correctly identify missing units and items', () => {
      const ownedChamps = new Set(['ahri'])
      const ownedItems = new Set(['rabadons'])

      const recommendation = scoreComp(mockComp, ownedChamps, ownedItems)

      expect(recommendation.missingUnits).toContain('ornn')
      expect(recommendation.missingUnits).toContain('sett')
      expect(recommendation.missingUnits).toContain('garen')
      expect(recommendation.missingUnits).not.toContain('ahri')

      expect(recommendation.missingItems).toContain('morellonomicon')
      expect(recommendation.missingItems).toContain('hextech_gunblade')
      expect(recommendation.missingItems).not.toContain('rabadons')
    })

    it('should cap score at 100', () => {
      // Perfect match with all bonuses should still cap at 100
      const ownedChamps = new Set(['ahri', 'ornn', 'sett', 'garen'])
      const ownedItems = new Set(['rabadons', 'morellonomicon', 'hextech_gunblade', 'bramble_vest', 'titans_resolve'])

      const recommendation = scoreComp(mockComp, ownedChamps, ownedItems)

      expect(recommendation.score).toBeLessThanOrEqual(100)
    })
  })

  describe('getRecommendations', () => {
    it('should return all comps sorted by score', () => {
      const ownedChamps = ['ahri', 'ornn']
      const ownedItems = ['rabadons', 'morellonomicon']

      const recommendations = getRecommendations(ownedChamps, ownedItems, {
        minScore: 0, // Allow all scores to see both comps
      })

      expect(recommendations).toHaveLength(2)
      // First comp should have higher score (has ahri + ornn + matching items)
      expect(recommendations[0].score).toBeGreaterThanOrEqual(recommendations[1].score)
    })

    it('should filter by minimum score', () => {
      const ownedChamps: string[] = [] // Own nothing
      const ownedItems: string[] = []

      const recommendations = getRecommendations(ownedChamps, ownedItems, {
        minScore: 50, // High threshold
      })

      // With no owned units/items, no comp should score >= 50
      expect(recommendations).toHaveLength(0)
    })

    it('should filter by owned units only', () => {
      const ownedChamps = ['sett', 'garen'] // Only low-cost comp units
      const ownedItems: string[] = []

      const recommendations = getRecommendations(ownedChamps, ownedItems, {
        ownedUnitsOnly: true,
      })

      // Only mockLowCostComp should pass (has sett + garen)
      expect(recommendations).toHaveLength(1)
      expect(recommendations[0].id).toBe('comp-test-2')
      expect(recommendations[0].missingUnits).toHaveLength(0)
    })

    it('should limit max results', () => {
      const ownedChamps = ['ahri']
      const ownedItems: string[] = []

      const recommendations = getRecommendations(ownedChamps, ownedItems, {
        maxResults: 1,
      })

      expect(recommendations).toHaveLength(1)
    })

    it('should filter by set', () => {
      const ownedChamps: string[] = []
      const ownedItems: string[] = []

      const recommendations = getRecommendations(ownedChamps, ownedItems, {
        sets: ['16'],
        minScore: 0, // Allow all scores
      })

      expect(recommendations.every((rec) => rec.set === '16')).toBe(true)
    })

    it('should filter by tags', () => {
      const ownedChamps: string[] = []
      const ownedItems: string[] = []

      const recommendations = getRecommendations(ownedChamps, ownedItems, {
        tags: ['Reroll'],
        minScore: 0,
      })

      // Only mockLowCostComp has 'Reroll' tag
      expect(recommendations).toHaveLength(1)
      expect(recommendations[0].tags).toContain('Reroll')
    })

    it('should handle empty inventory gracefully', () => {
      const recommendations = getRecommendations([], [], { minScore: 0 })

      expect(recommendations).toHaveLength(2)
      expect(recommendations.every((rec) => rec.score === 0 || rec.score > 0)).toBe(true)
    })
  })

  describe('scoring weights', () => {
    it('should sum weights to 100', () => {
      const { weights } = SCORING_CONFIG
      const total = weights.coreUnits + weights.optionalUnits + weights.carryItems + weights.supportItems

      expect(total).toBe(100)
    })

    it('should prioritize core units correctly', () => {
      const ownedOnlyCore = new Set(['ahri'])
      const ownedOnlyOptional = new Set(['sett', 'garen', 'ornn'])
      const itemsNone = new Set<string>()

      const breakdownCore = calculateScoreBreakdown(mockComp, ownedOnlyCore, itemsNone)
      const breakdownOptional = calculateScoreBreakdown(mockComp, ownedOnlyOptional, itemsNone)

      // Core units have higher weight (50) than optional (15)
      expect(breakdownCore.coreUnitsScore).toBeGreaterThan(breakdownOptional.optionalUnitsScore)
    })
  })
})

