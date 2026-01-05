# No Database Mode Implementation

This document explains the "no database" implementation with runtime validation using Zod.

---

## Overview

The app now loads data from `/public/data/comps.json` at startup, validates it using Zod schemas, and provides helper functions to query/filter comps based on user selections.

---

## 1. TypeScript Schema (src/types.ts)

Defines core types for:

### Champion
```typescript
type Champion = {
  id: string
  name: string
  cost: number           // 1-5
  traits: string[]
  imageUrl: string       // CommunityDragon URL
}
```

### Item
```typescript
type Item = {
  id: string
  name: string
  imageUrl: string       // CommunityDragon URL
}
```

### CompUnit
```typescript
type UnitRole = 'carry' | 'tank' | 'support' | 'flex'

type CompUnit = {
  championId: string
  role: UnitRole
  recommendedItems: string[]   // item IDs
  optionalItems?: string[]     // item IDs
}
```

### BoardPosition
```typescript
type BoardPosition = {
  championId: string
  x: number              // 0-6 (7 columns)
  y: number              // 0-3 (4 rows)
}
```

### Comp
```typescript
type Comp = {
  id: string
  name: string
  set: string            // e.g., "16"
  patch: string          // e.g., "14.24"
  description: string
  tags: string[]         // e.g., ["Reroll", "AP", "Late Game"]
  units: CompUnit[]
  positioning: BoardPosition[]
}
```

### ScoredComp
```typescript
type ScoredComp = Comp & {
  score: number          // 0-100
  matchPercentage: number // same as score
}
```

---

## 2. Runtime Validation (src/schemas.ts)

Uses Zod to validate data at runtime:

```typescript
import { z } from 'zod'

const ChampionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number().int().min(1).max(5),
  traits: z.array(z.string()),
  imageUrl: z.string().url()
})

const CompSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  set: z.string().min(1),
  patch: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string()),
  units: z.array(CompUnitSchema).min(1),
  positioning: z.array(BoardPositionSchema).min(1)
})

// Full file schema
const CompsDataSchema = z.object({
  champions: z.array(ChampionSchema),
  items: z.array(ItemSchema),
  comps: z.array(CompSchema)
})
```

Validates:
- Required fields exist
- Correct types (string, number, array)
- Constraints (cost 1-5, x 0-6, y 0-3)
- Valid URLs for images

---

## 3. Data Structure (public/data/comps.json)

File structure:
```json
{
  "champions": [
    {
      "id": "ahri",
      "name": "Ahri",
      "cost": 4,
      "traits": ["Sage", "Mythic"],
      "imageUrl": "https://raw.communitydragon.org/..."
    }
  ],
  "items": [
    {
      "id": "infinity_edge",
      "name": "Infinity Edge",
      "imageUrl": "https://raw.communitydragon.org/..."
    }
  ],
  "comps": [
    {
      "id": "comp-1",
      "name": "Mythic Ahri",
      "set": "16",
      "patch": "14.24",
      "description": "Stack AP items on Ahri...",
      "tags": ["AP", "Mythic", "Late Game", "S-Tier"],
      "units": [
        {
          "championId": "ahri",
          "role": "carry",
          "recommendedItems": ["rabadons", "morellonomicon"],
          "optionalItems": ["hextech_gunblade"]
        }
      ],
      "positioning": [
        { "championId": "ahri", "x": 3, "y": 2 },
        { "championId": "ornn", "x": 3, "y": 0 }
      ]
    }
  ]
}
```

**Current data includes:**
- 12 champions (Ahri, Sett, Ornn, Kog'Maw, etc.)
- 10 items (Infinity Edge, Rabadon's, etc.)
- 6 example comps (Mythic Ahri, Sniper Reroll, Assassin Zed, etc.)

---

## 4. Validation Flow (src/data/dataValidator.ts)

### On App Startup

```typescript
// App.tsx calls this on mount
const result = await loadAndValidateData()

if (!result.isValid) {
  // Show friendly error page
  return <DataValidationError error={result.error} details={result.details} />
}

// Data is cached and ready to use
```

### Validation Steps

1. **Fetch** `/data/comps.json`
2. **Parse** JSON
3. **Validate schema** using Zod (types, required fields, constraints)
4. **Validate business rules**:
   - All `championId` references exist in `champions` array
   - All `itemId` references exist in `items` array
   - No duplicate board positions (same x,y)
5. **Cache** validated data
6. **Return** success or detailed error

### Error Handling

If validation fails, shows:
- User-friendly error message
- Technical details (expandable)
- Common fixes checklist
- Retry button
- Link to view raw JSON

Example errors caught:
```
❌ Comp "Mythic Ahri" references unknown champion: janna
❌ Invalid cost: expected 1-5, got 7
❌ Invalid position: x=8 (must be 0-6)
❌ Duplicate position: x=3, y=2 used twice
```

---

## 5. Helper Functions (src/data/compHelpers.ts)

### getAllChampions()
```typescript
const champions = getAllChampions()
// Returns Champion[]
```

### getAllItems()
```typescript
const items = getAllItems()
// Returns Item[]
```

### getAllComps()
```typescript
const comps = getAllComps()
// Returns Comp[]
```

### getCompById(id)
```typescript
const comp = getCompById('comp-1')
// Returns Comp | undefined
```

### getChampionById(id)
```typescript
const champ = getChampionById('ahri')
// Returns Champion | undefined
```

### getItemById(id)
```typescript
const item = getItemById('infinity_edge')
// Returns Item | undefined
```

---

## 6. Scoring & Filtering

### scoreCompAgainstUserInput(comp, champIds, itemIds)

**Logic:**
- 60% weight on champion matches
- 40% weight on item matches

**Algorithm:**
```typescript
champScore = (matchingChamps / totalCompsChamps) * 60
itemScore = (matchingItems / totalCompsItems) * 40
totalScore = champScore + itemScore (0-100)
```

**Example:**
```typescript
// User selected: ['ahri', 'ornn', 'sett']
// User selected items: ['rabadons', 'morellonomicon']

// Comp requires: ['ahri', 'ornn', 'sett', 'morgana']
// Comp items: ['rabadons', 'morellonomicon', 'hextech_gunblade']

champScore = (3 / 4) * 60 = 45
itemScore = (2 / 3) * 40 = 26.67
totalScore = 71.67 → 72% match
```

### getRecommendedComps(champIds, itemIds, minScore?)

Returns sorted array of `ScoredComp[]`:
- Calculates score for each comp
- Filters by `minScore` (default 0)
- Sorts by score descending (highest first)

**Usage:**
```typescript
const recommendedComps = getRecommendedComps(
  ['ahri', 'ornn', 'sett'],
  ['rabadons', 'morellonomicon'],
  30  // min 30% match
)

// Returns:
// [
//   { ...comp1, score: 85, matchPercentage: 85 },
//   { ...comp2, score: 72, matchPercentage: 72 },
//   { ...comp3, score: 45, matchPercentage: 45 }
// ]
```

---

## 7. Additional Helpers

### getCompsBySet(setNumber)
```typescript
const set16Comps = getCompsBySet('16')
```

### getCompsByTags(tags)
```typescript
const rerollComps = getCompsByTags(['Reroll', 'Early Game'])
// Returns comps with ANY matching tag
```

### searchComps(query)
```typescript
const results = searchComps('sniper')
// Searches name and description (case-insensitive)
```

### getAllTags()
```typescript
const tags = getAllTags()
// Returns sorted unique tags: ['A-Tier', 'AD', 'AP', 'Assassin', ...]
```

### getAllSets()
```typescript
const sets = getAllSets()
// Returns sorted unique set numbers: ['16', '17', ...]
```

---

## 8. UI Integration

### Home Page (/)
- Landing page with "Start" button → `/builder`

### Builder Page (/builder)
- Multi-select champion picker (shows all from `getAllChampions()`)
- Multi-select item picker (shows all from `getAllItems()`)
- Passes selections via URL params to `/results`

### Results Page (/results)
- Reads URL params: `?champs=ahri,ornn&items=rabadons`
- Calls `getRecommendedComps(champIds, itemIds)`
- Displays sorted comps with match percentage
- Shows "X% match" badge on each comp card

### Comp Detail Page (/comp/:id)
- Calls `getCompById(id)`
- Renders 7×4 board grid with champion positioning
- Shows units with roles, items, and traits
- Displays recommended vs optional items

### Admin Page (/admin)
- Placeholder for future comp editor
- No functionality in MVP (just login form stub)

---

## 9. File Locations

```
frontend/
├── public/
│   └── data/
│       └── comps.json              ← Your data file
├── src/
│   ├── types.ts                    ← TypeScript types
│   ├── schemas.ts                  ← Zod validation schemas
│   ├── data/
│   │   ├── dataValidator.ts        ← Load & validate JSON
│   │   └── compHelpers.ts          ← Query/filter helpers
│   ├── components/
│   │   ├── DataValidationError.tsx ← Error page
│   │   ├── ErrorBoundary.tsx       ← React error boundary
│   │   ├── Layout.tsx              ← Header + nav
│   │   └── ToastProvider.tsx       ← Toast notifications
│   ├── pages/
│   │   ├── Home.tsx                ← Landing page
│   │   ├── Builder.tsx             ← Champion/item selector
│   │   ├── Results.tsx             ← Recommended comps
│   │   ├── CompDetail.tsx          ← Comp detail + board
│   │   └── Admin.tsx               ← Admin placeholder
│   ├── App.tsx                     ← Router + validation
│   └── main.tsx                    ← Entry point
```

---

## 10. How to Add More Comps

Edit `public/data/comps.json`:

```json
{
  "comps": [
    {
      "id": "comp-7",
      "name": "Your Comp Name",
      "set": "16",
      "patch": "14.24",
      "description": "Describe the comp strategy...",
      "tags": ["Your", "Tags", "Here"],
      "units": [
        {
          "championId": "existing_champ_id",
          "role": "carry",
          "recommendedItems": ["item_id_1", "item_id_2"],
          "optionalItems": ["item_id_3"]
        }
      ],
      "positioning": [
        { "championId": "existing_champ_id", "x": 3, "y": 2 }
      ]
    }
  ]
}
```

**Rules:**
- `id` must be unique
- `championId` must exist in `champions` array
- `itemId` must exist in `items` array
- `x` must be 0-6, `y` must be 0-3
- No duplicate positions (same x,y)
- At least 1 unit required
- At least 1 position required

If you violate rules, the app shows a validation error on startup.

---

## 11. Future Enhancements

### Add More Champions
Add to `champions` array:
```json
{
  "id": "lux",
  "name": "Lux",
  "cost": 3,
  "traits": ["Mage", "Invoker"],
  "imageUrl": "https://raw.communitydragon.org/latest/game/assets/characters/tft13_lux/hud/tft13_lux_square.png"
}
```

### Add More Items
Add to `items` array:
```json
{
  "id": "bloodthirster",
  "name": "Bloodthirster",
  "imageUrl": "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/Bloodthirster.png"
}
```

### Support Set 17
1. Add Set 17 champions to `champions` array with `"set": "17"` metadata (optional)
2. Add Set 17 comps to `comps` array with `"set": "17"`
3. Use `getCompsBySet('17')` to filter
4. Add set selector dropdown in UI

### Admin Comp Editor
- Create form to add/edit comps
- Use helper functions to save back to JSON
- Note: File writes won't work on some hosting (Vercel read-only filesystem)
- Solution: Use API route to write, or migrate to Supabase

---

## 12. Testing Validation

### Test Invalid Data

Edit `comps.json` to introduce errors:

**Missing required field:**
```json
{
  "id": "comp-1",
  "name": "Missing Set Field"
  // ❌ No "set" field → validation fails
}
```

**Invalid champion reference:**
```json
{
  "units": [
    { "championId": "nonexistent_champion", "role": "carry", ... }
  ]
  // ❌ championId doesn't exist → validation fails
}
```

**Invalid board position:**
```json
{
  "positioning": [
    { "championId": "ahri", "x": 10, "y": 2 }
  ]
  // ❌ x=10 exceeds max (6) → validation fails
}
```

**Duplicate position:**
```json
{
  "positioning": [
    { "championId": "ahri", "x": 3, "y": 2 },
    { "championId": "ornn", "x": 3, "y": 2 }
  ]
  // ❌ Same x,y used twice → validation fails
}
```

Refresh app → validation error shows with details.

---

## 13. Performance Notes

- Data is **cached** after first load (no repeated fetches)
- `getAllComps()` etc. return cached data instantly
- Filtering/scoring happens in memory (fast for <100 comps)
- For 1000+ comps, consider indexing or virtual scrolling

---

## 14. Troubleshooting

### "Failed to load comps.json"
- Check file exists: `public/data/comps.json`
- Check file is valid JSON (no trailing commas, quotes)
- Check dev server is running: `npm run dev`

### "Validation failed"
- Click "Show technical details" to see Zod errors
- Common fixes:
  - Add missing required fields
  - Fix typos in champion/item IDs
  - Check board position ranges (0-6, 0-3)
  - Ensure no duplicate positions

### "Data not loaded" error in helpers
- Make sure `App.tsx` calls `loadAndValidateData()` on mount
- Check `validationResult.isValid` before rendering routes

### Images not loading
- Check CommunityDragon URLs are correct
- Some champions have different keys (e.g., `tft13_ahri` vs `tft9_ahri`)
- Use `onError` fallback (already implemented)

---

## Summary

✅ **Schema defined** in `types.ts` and `schemas.ts`  
✅ **6 example comps** in `comps.json`  
✅ **Runtime validation** using Zod at app startup  
✅ **Helper functions** for querying/filtering comps  
✅ **Scoring algorithm** (60% champs, 40% items)  
✅ **Friendly error page** if validation fails  
✅ **UI integrated** in Builder, Results, CompDetail pages  

Ready to use! 🎮

