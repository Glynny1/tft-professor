import { useMemo, useState } from 'react'
import { getFallbackSprite, getSpriteUrl } from '../utils/sprites'

type SpriteProps = {
  type: 'champion' | 'item'
  id: string
  slug?: string
  size?: 'sm' | 'md' | 'lg'
  alt?: string
  className?: string
}

const sizeMap: Record<NonNullable<SpriteProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function Sprite({ type, id, slug, size = 'md', alt, className }: SpriteProps) {
  const src = useMemo(() => getSpriteUrl(type, id, { slug }), [id, slug, type])
  const [isBroken, setIsBroken] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fallback = useMemo(() => getFallbackSprite(), [])

  return (
    <div className={`relative ${sizeMap[size]} ${className ?? ''}`}>
      {isLoading && (
        <div className="absolute inset-0 animate-pulse rounded-md border border-slate/50 bg-slate/40" />
      )}
      <img
        src={isBroken ? fallback : src}
        alt={alt ?? id}
        loading="lazy"
        draggable={false}
        className={`h-full w-full rounded-md border border-slate/50 object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ imageRendering: 'pixelated', transition: 'opacity 120ms ease' }}
        onError={() => {
          if (!isBroken) setIsBroken(true)
          setIsLoading(false)
        }}
        onLoad={() => {
          setIsLoading(false)
          if (isBroken) setIsBroken(false)
        }}
      />
    </div>
  )
}

