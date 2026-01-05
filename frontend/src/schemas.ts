import { z } from 'zod'

// Zod schemas for runtime validation

export const ChampionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number().int().min(1).max(5),
  traits: z.array(z.string()),
  cdnSlug: z.string().optional()
})

export const ItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cdnSlug: z.string().optional()
})

export const CompUnitSchema = z.object({
  championId: z.string().min(1),
  role: z.enum(['carry', 'tank', 'support', 'flex']),
  recommendedItems: z.array(z.string()),
  optionalItems: z.array(z.string()).optional()
})

export const BoardPositionSchema = z.object({
  championId: z.string().min(1),
  x: z.number().int().min(0).max(6), // 7 columns (0-6)
  y: z.number().int().min(0).max(3) // 4 rows (0-3)
})

export const CompSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  set: z.string().min(1),
  patch: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string()),
  units: z.array(CompUnitSchema).min(1),
  positioning: z.array(BoardPositionSchema).min(1)
})

// Schema for the entire comps.json file
export const CompsDataSchema = z.object({
  champions: z.array(ChampionSchema),
  items: z.array(ItemSchema),
  comps: z.array(CompSchema)
})

// Type inference from schemas (for use in code)
export type ChampionData = z.infer<typeof ChampionSchema>
export type ItemData = z.infer<typeof ItemSchema>
export type CompData = z.infer<typeof CompSchema>
export type CompsData = z.infer<typeof CompsDataSchema>

