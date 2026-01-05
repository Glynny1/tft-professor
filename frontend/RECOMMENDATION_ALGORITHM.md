# Comp Recommendation Algorithm

This document explains the scoring algorithm used to recommend TFT team compositions based on the user's owned champions and items.

---

## Overview

The recommendation engine scores each comp from 0-100 based on how well it matches the user's inventory. Higher scores indicate better matches. The algorithm considers:

1. **Core units** (carries) - highest weight
2. **Optional units** (tanks/support) - medium weight  
3. **Carry items** - high weight
4. **Support items** - lower weight
5. **Bonuses** - for complete sets, cost efficiency, etc.

---

## Scoring Configuration

All weights and thresholds are defined in `src/data/scoringConfig.ts`:

```typescript
export const SCORING_CONFIG = {
  weights: {
    coreUnits: 50,       // 50% weight for carry units
    optionalUnits: 15,   // 15% weight for tanks/support
    carryItems: 25,      // 25% weight for carry items
    supportItems: 10,    // 10% weight for tank/support items
  },
  thresholds: {
    minRecommendScore: 30,   // Minimum score to recommend
    highConfidence: 70,      // "High confidence" threshold
    perfectMatch: 95,        // "Perfect match" threshold
  },
  bonuses: {
    allCoreUnits: 10,        // Bonus if user owns ALL carries
    allCarryItems: 8,        // Bonus if perfect items for a carry
    costEfficiency: 5,       // Bonus for low-cost comps
  },
}
```

**Total weights: 50 + 15 + 25 + 10 = 100**

---

## Scoring Formula

### Base Score (0-100)

```
baseScore = coreUnitsScore + optionalUnitsScore + carryItemsScore + supportItemsScore
```

Where:
- `coreUnitsScore = (ownedCarries / totalCarries) * 50`
- `optionalUnitsScore = (ownedOptional / totalOptional) * 15`
- `carryItemsScore = (ownedCarryItems / totalCarryItems) * 25`
- `supportItemsScore = (ownedSupportItems / totalSupportItems) * 10`

### Bonuses (0-23)

```
totalBonus = (allCoreUnits ? 10 : 0) 
           + (allCarryItems ? 8 : 0) 
           + (costEfficiency ? 5 : 0)
```

- **All core units bonus (10)**: User owns every carry champion
- **All carry items bonus (8)**: User owns all 3 items for at least one carry
- **Cost efficiency bonus (5)**: Average unit cost ≤ 2.5 (easier to build)

### Final Score

```
finalScore = min(baseScore + totalBonus, 100)
```

Capped at 100 to prevent scores above 100%.

---

## Example Calculations

### Example 1: Perfect Match

**Comp:** Mythic Ahri (requires Ahri carry + 3 AP items + tanks)

**User owns:**
- Champions: Ahri, Ornn, Sett, Garen ✓
- Items: Rabadon's, Morellonomicon, Hextech Gunblade, Bramble Vest, Titan's Resolve ✓

**Calculation:**
```
coreUnitsScore = (1/1) * 50 = 50       (owns Ahri)
optionalUnitsScore = (3/3) * 15 = 15   (owns Ornn, Sett, Garen)
carryItemsScore = (3/3) * 25 = 25      (owns all Ahri items)
supportItemsScore = (3/3) * 10 = 10    (owns all tank items)
baseScore = 50 + 15 + 25 + 10 = 100

Bonuses:
+ allCoreUnits = 10 (owns all carries)
+ allCarryItems = 8 (perfect Ahri items)
+ costEfficiency = 0 (avg cost = 2.75 > 2.5)
totalBonus = 18

finalScore = min(100 + 18, 100) = 100
```

**Result:** 100% match, "perfect" confidence

---

### Example 2: Partial Match

**Comp:** Sniper Reroll (requires Kog'Maw, Caitlyn + AD items)

**User owns:**
- Champions: Kog'Maw, Sett ✓
- Items: Infinity Edge, Giant Slayer ✓

**Calculation:**
```
coreUnitsScore = (1/2) * 50 = 25       (owns Kog'Maw, missing Caitlyn)
optionalUnitsScore = (1/2) * 15 = 7.5  (owns Sett, missing others)
carryItemsScore = (2/5) * 25 = 10      (owns 2/5 carry items)
supportItemsScore = (0/3) * 10 = 0     (no tank items)
baseScore = 25 + 7.5 + 10 + 0 = 42.5

Bonuses:
+ allCoreUnits = 0 (missing Caitlyn)
+ allCarryItems = 0 (incomplete items)
+ costEfficiency = 5 (low-cost comp)
totalBonus = 5

finalScore = 42.5 + 5 = 47.5 → 48
```

**Result:** 48% match, "medium" confidence

---

### Example 3: No Match

**Comp:** Any comp

**User owns:**
- Champions: None
- Items: None

**Calculation:**
```
coreUnitsScore = 0
optionalUnitsScore = 0
carryItemsScore = 0
supportItemsScore = 0
baseScore = 0

Bonuses: 0

finalScore = 0
```

**Result:** 0% match, "low" confidence, **filtered out** (below minRecommendScore of 30)

---

## Confidence Levels

Based on final score:

| Score Range | Confidence | Meaning |
|-------------|------------|---------|
| 95-100 | **Perfect** | Near-perfect match, highly recommended |
| 70-94 | **High** | Strong match, recommended |
| 30-69 | **Medium** | Viable option with missing pieces |
| 0-29 | **Low** | Not recommended (filtered by default) |

---

## Explanation Generation

For each recommendation, a human-readable explanation is generated to tell the user WHY it was recommended.

### Example Explanations

**High score:**
> "You own all 2 core units • Perfect items for kogmaw • Low-cost units (easy to build)"

**Medium score:**
> "You own 1/2 core units • 3/5 key items available"

**With bonuses:**
> "You own all 1 core units • Perfect items for ahri"

### Rules

- Max 3 reasons shown
- Priority order:
  1. Core units match
  2. Perfect carry items
  3. Partial item matches
  4. Cost efficiency bonus
  5. Fallback: total units available

---

## Filtering Options

Users can filter recommendations with:

### 1. Minimum Score (`minScore`)
Default: 30%

Only show comps scoring at least this threshold.

```typescript
getRecommendations(champs, items, { minScore: 50 })
```

### 2. Owned Units Only (`ownedUnitsOnly`)
Default: false

Only show comps where user owns ALL required units.

```typescript
getRecommendations(champs, items, { ownedUnitsOnly: true })
```

### 3. Max Results (`maxResults`)
Default: unlimited

Limit number of recommendations returned.

```typescript
getRecommendations(champs, items, { maxResults: 5 })
```

### 4. Set Filter (`sets`)
Default: all sets

Only show comps from specific sets.

```typescript
getRecommendations(champs, items, { sets: ['16'] })
```

### 5. Tag Filter (`tags`)
Default: all tags

Only show comps with specific tags.

```typescript
getRecommendations(champs, items, { tags: ['Reroll', 'Early Game'] })
```

---

## Score Breakdown

Each recommendation includes a detailed breakdown:

```typescript
{
  score: 72,
  matchPercentage: 72,
  breakdown: {
    coreUnitsScore: 50,
    optionalUnitsScore: 7.5,
    carryItemsScore: 10,
    supportItemsScore: 0,
    bonuses: {
      allCoreUnits: 10,
      costEfficiency: 5
    },
    totalBonus: 15
  },
  explanation: "You own all 1 core units • 2/5 key items available • Low-cost units",
  confidence: "high",
  missingUnits: ["caitlyn", "garen"],
  missingItems: ["last_whisper", "red_buff", "bramble_vest"]
}
```

This breakdown is shown to users via the expandable "Score breakdown" section on each comp card.

---

## Algorithm Rationale

### Why these weights?

**Core units (50%):**
- Most important - you can't play the comp without the carry
- Highest weight ensures comps match your carry champions first

**Carry items (25%):**
- Second most important - carries need items to be effective
- Items are easier to build than finding specific champions

**Optional units (15%):**
- Less critical - tanks/support are often flexible
- Can substitute similar units with same traits

**Support items (10%):**
- Least critical - tank items are generic and flexible
- Many comps work with various tank item combinations

### Why these bonuses?

**All core units (+10):**
- Owning all carries significantly increases comp viability
- Large bonus encourages building comps you can fully execute

**All carry items (+8):**
- Having perfect items for even one carry is very valuable
- Rewards completing at least one unit fully

**Cost efficiency (+5):**
- Low-cost comps are easier to build (reroll strategies)
- Small bonus reflects this practical advantage

---

## Testing

The algorithm is fully tested with 23 unit tests in `recommendationEngine.test.ts`.

**Run tests:**
```bash
npm run test
```

**Run tests with UI:**
```bash
npm run test:ui
```

**Test coverage:**
- Score calculation (all components)
- Explanation generation
- Confidence assignment
- Filtering logic
- Edge cases (empty inventory, perfect match, etc.)

---

## Usage

### Basic usage:

```typescript
import { getCompRecommendations } from './data/compHelpers'

const recommendations = getCompRecommendations(
  ['ahri', 'ornn', 'sett'],  // owned champions
  ['rabadons', 'morellonomicon']  // owned items
)

// Returns CompRecommendation[] sorted by score (highest first)
```

### With filters:

```typescript
const recommendations = getCompRecommendations(
  ['ahri', 'ornn'],
  ['rabadons'],
  {
    minScore: 50,           // Only show 50%+ matches
    ownedUnitsOnly: false,  // Allow missing units
    maxResults: 10,         // Top 10 only
    sets: ['16'],           // Set 16 only
    tags: ['AP', 'Late Game']  // AP late-game comps only
  }
)
```

---

## Future Enhancements

Potential improvements to the algorithm:

### 1. Trait Synergy Bonus
Reward comps where user owns many champions of the same trait.

```typescript
traitBonus = (matchingTraitUnits / totalTraits) * 5
```

### 2. Popularity/Meta Weighting
Boost scores for meta comps (based on win rate data).

```typescript
if (comp.isMetaComp) {
  metaBonus = 3
}
```

### 3. Dynamic Weights
Let users adjust weights based on playstyle.

```typescript
getRecommendations(champs, items, {
  customWeights: {
    coreUnits: 60,  // Prefer comps with owned carries
    carryItems: 30,  // Less emphasis on items
  }
})
```

### 4. Item Flexibility
Some items are interchangeable (e.g., Morello vs. Red Buff).

```typescript
if (hasFlexibleItem(itemId)) {
  partialCredit = 0.7  // 70% credit for substitute
}
```

### 5. Champion Tier Weighting
Higher-cost champions are harder to find.

```typescript
championImportance = (5 - championCost) / 5
// 5-cost = 0 importance (hardest to find)
// 1-cost = 0.8 importance (easiest to find)
```

---

## Performance

**Time complexity:** O(n * m)
- n = number of comps
- m = average units per comp

**Space complexity:** O(n)
- Stores all recommendations in memory

**Typical performance:**
- 50 comps, 5 units each: ~1ms
- 500 comps, 8 units each: ~10ms

Sufficient for real-time filtering in the UI.

---

## Maintenance

To adjust scoring:

1. **Edit `src/data/scoringConfig.ts`**
2. **Ensure weights sum to 100**
3. **Update tests if thresholds change**
4. **Run `npm run test` to verify**

Example:
```typescript
export const SCORING_CONFIG = {
  weights: {
    coreUnits: 60,       // Increased from 50
    optionalUnits: 10,   // Decreased from 15
    carryItems: 25,      // Unchanged
    supportItems: 5,     // Decreased from 10
  },
  // ...
}
```

This makes core units even more important than optional units.

---

## Summary

The recommendation algorithm:
- ✅ Scores comps 0-100 based on weighted criteria
- ✅ Prioritizes core units (50%) and carry items (25%)
- ✅ Awards bonuses for complete sets
- ✅ Generates human-readable explanations
- ✅ Supports filtering (min score, owned only, tags, sets)
- ✅ Returns detailed breakdowns for transparency
- ✅ Fully tested with 23 unit tests

**Result:** Users get relevant, well-explained comp recommendations tailored to their current inventory.

