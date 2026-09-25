import { Images } from 'lucide-react'
import { resolveImageSrc } from '../lib/images'

interface BoardCollageProps {
  urls: string[]
  className?: string
}

function Tile({ src }: { src: string }) {
  const resolved = resolveImageSrc(src)
  if (!resolved) {
    return <div className="h-full w-full bg-milky-pink/80" />
  }
  return (
    <img
      src={resolved}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
    />
  )
}

function Cell({ src, className = '' }: { src: string; className?: string }) {
  return (
    <div className={`min-h-0 overflow-hidden ${className}`}>
      <Tile src={src} />
    </div>
  )
}

export function BoardCollage({ urls, className = '' }: BoardCollageProps) {
  const images = urls.filter(Boolean).slice(0, 5)

  if (images.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-milky-pink via-pastel-yellow/30 to-burgundy/10 text-muted ${className}`}
      >
        <Images size={28} strokeWidth={1.5} />
        <span className="text-xs font-medium">No previews yet</span>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <Tile src={images[0]} />
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div className={`grid grid-cols-2 gap-0.5 overflow-hidden ${className}`}>
        <Cell src={images[0]} />
        <Cell src={images[1]} />
      </div>
    )
  }

  if (images.length === 3) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden ${className}`}>
        <Cell src={images[0]} className="row-span-2" />
        <Cell src={images[1]} />
        <Cell src={images[2]} />
      </div>
    )
  }

  if (images.length === 4) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden ${className}`}>
        {images.map((src) => (
          <Cell key={src} src={src} />
        ))}
      </div>
    )
  }

  // 5: one featured tile + 2×2 of the rest
  return (
    <div className={`grid grid-cols-4 grid-rows-2 gap-0.5 overflow-hidden ${className}`}>
      <Cell src={images[0]} className="col-span-2 row-span-2" />
      <Cell src={images[1]} />
      <Cell src={images[2]} />
      <Cell src={images[3]} />
      <Cell src={images[4]} />
    </div>
  )
}
