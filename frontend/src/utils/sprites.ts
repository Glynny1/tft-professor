const CDN_BASE = 'https://raw.communitydragon.org'

type SpriteKind = 'champion' | 'item'

type SpriteOptions = {
  /** CommunityDragon version, defaults to 'latest' */
  version?: string
  /** Optional explicit slug to override derived path */
  slug?: string
}

const normalizeId = (id: string) => id.toLowerCase().replace(/[^a-z0-9]/g, '')

const fallbackSvg =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#1c2b3f"/><path d="M32 14c5.5 0 10 4.5 10 10 0 4.4-2.8 8.1-6.8 9.5l3.3 10.4-6.5-4.4-6.5 4.4 3.3-10.4C24.8 32.1 22 28.4 22 24c0-5.5 4.5-10 10-10Z" fill="#d4af37"/></svg>`,
  )

export function getChampionSpriteUrl(championId: string, options: SpriteOptions = {}) {
  const version = options.version ?? 'latest'
  const slug = options.slug ?? `tft13_${normalizeId(championId)}`
  return `${CDN_BASE}/${version}/game/assets/characters/${slug}/hud/${slug}_square.png`
}

export function getItemSpriteUrl(itemId: string, options: SpriteOptions = {}) {
  const version = options.version ?? 'latest'
  const slug = options.slug ?? `standard/${itemId}.png`
  return `${CDN_BASE}/${version}/game/assets/maps/particles/tft/item_icons/${slug}`
}

export function getSpriteUrl(kind: SpriteKind, id: string, options: SpriteOptions = {}) {
  return kind === 'champion' ? getChampionSpriteUrl(id, options) : getItemSpriteUrl(id, options)
}

export function getFallbackSprite() {
  return fallbackSvg
}

