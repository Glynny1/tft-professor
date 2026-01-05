import { CompsDataSchema, type CompsData } from '../schemas'
import type { Champion, Item, Comp } from '../types'

let cachedData: {
  champions: Champion[]
  items: Item[]
  comps: Comp[]
} | null = null

export type ValidationError = {
  isValid: false
  error: string
  details?: Record<string, unknown> | string | null
}

export type ValidationSuccess = {
  isValid: true
  data: {
    champions: Champion[]
    items: Item[]
    comps: Comp[]
  }
}

export type ValidationResult = ValidationError | ValidationSuccess

/**
 * Loads and validates comps.json from /public/data/
 * Returns validation result with typed data or error details
 */
export async function loadAndValidateData(): Promise<ValidationResult> {
  // Return cached data if already loaded
  if (cachedData) {
    return { isValid: true, data: cachedData }
  }

  try {
    // Fetch the JSON file
    const response = await fetch('/data/comps.json')

    if (!response.ok) {
      return {
        isValid: false,
        error: `Failed to load comps.json: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText }
      }
    }

    const rawData = await response.json()

    // Validate using Zod schema
    const parseResult = CompsDataSchema.safeParse(rawData)

    if (!parseResult.success) {
      return {
        isValid: false,
        error: 'comps.json validation failed',
        details: parseResult.error.format()
      }
    }

    const validatedData = parseResult.data as CompsData

    // Additional business logic validation
    const businessValidation = validateBusinessRules(validatedData)
    if (!businessValidation.isValid) {
      return businessValidation
    }

    // Cache the validated data
    cachedData = {
      champions: validatedData.champions,
      items: validatedData.items,
      comps: validatedData.comps
    }

    return { isValid: true, data: cachedData }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error loading data',
      details: error instanceof Error ? error.stack ?? error.message : String(error)
    }
  }
}

/**
 * Additional business logic validation
 * Ensures references between comps, champions, and items are valid
 */
function validateBusinessRules(data: CompsData): ValidationResult | { isValid: true } {
  const championIds = new Set(data.champions.map((c) => c.id))
  const itemIds = new Set(data.items.map((i) => i.id))

  // Check each comp for invalid references
  for (const comp of data.comps) {
    // Validate champion references in units
    for (const unit of comp.units) {
      if (!championIds.has(unit.championId)) {
        return {
          isValid: false,
          error: `Comp "${comp.name}" (${comp.id}) references unknown champion: ${unit.championId}`
        }
      }

      // Validate item references
      for (const itemId of [...unit.recommendedItems, ...(unit.optionalItems ?? [])]) {
        if (!itemIds.has(itemId)) {
          return {
            isValid: false,
            error: `Comp "${comp.name}" (${comp.id}) references unknown item: ${itemId} on champion ${unit.championId}`
          }
        }
      }
    }

    // Validate champion references in positioning
    for (const pos of comp.positioning) {
      if (!championIds.has(pos.championId)) {
        return {
          isValid: false,
          error: `Comp "${comp.name}" (${comp.id}) positioning references unknown champion: ${pos.championId}`
        }
      }
    }

    // Check for duplicate positioning (same x,y used twice)
    const positionKeys = comp.positioning.map((p) => `${p.x},${p.y}`)
    const uniquePositions = new Set(positionKeys)
    if (positionKeys.length !== uniquePositions.size) {
      return {
        isValid: false,
        error: `Comp "${comp.name}" (${comp.id}) has duplicate board positions`
      }
    }
  }

  return { isValid: true }
}

/**
 * Get cached data (must call loadAndValidateData first)
 */
export function getCachedData() {
  if (!cachedData) {
    throw new Error('Data not loaded. Call loadAndValidateData() first.')
  }
  return cachedData
}

/**
 * Clear cache (useful for testing or reloading)
 */
export function clearCache() {
  cachedData = null
}

