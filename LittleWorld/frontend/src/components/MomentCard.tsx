import { Heart, ImageOff, Loader2 } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import type { Moment } from '../types'
import { formatRelativeTime, resolveImageSrc } from '../lib/images'

interface MomentCardProps {
  moment: Moment
  onLike: (id: string) => Promise<void> | void
  liked?: boolean
  style?: CSSProperties
}

export function MomentCard({ moment, onLike, liked = false, style }: MomentCardProps) {
  const [liking, setLiking] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const src = resolveImageSrc(moment.imageUrl)
  const pending = moment.status === 'PENDING'
  const failed = moment.status === 'FAILED'

  async function handleLike() {
    if (liking || liked) return
    setLiking(true)
    try {
      await onLike(moment.id)
    } finally {
      setLiking(false)
    }
  }

  return (
    <article
      style={style}
      className={`animate-fade-up overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow hover:shadow-md ${
        pending ? 'opacity-80' : ''
      }`}
    >
      <div className="relative aspect-[4/3] bg-milky-pink/80">
        {src && !imgFailed ? (
          <img
            src={src}
            alt={moment.userCaption || 'Shared moment'}
            className={`h-full w-full object-cover ${pending ? 'animate-soft-pulse' : ''}`}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
            <ImageOff size={28} strokeWidth={1.5} />
            <span className="max-w-[80%] text-center text-xs">No image</span>
          </div>
        )}

        {pending && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/45 to-transparent px-3 py-2.5 text-xs font-medium text-white">
            <Loader2 size={14} className="animate-spin-slow" />
            Processing…
          </div>
        )}
        {failed && (
          <div className="absolute left-3 top-3 rounded-full bg-burgundy px-2.5 py-1 text-xs font-semibold text-white">
            Failed
          </div>
        )}
      </div>

      <div className="p-4">
        {moment.userCaption ? (
          <p className="text-[15px] leading-snug text-charcoal">{moment.userCaption}</p>
        ) : pending ? (
          <p className="text-sm italic text-muted">Waiting for caption…</p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void handleLike()}
            disabled={liking || liked}
            className="group inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-burgundy transition hover:bg-milky-pink disabled:opacity-60"
            aria-label={liked ? 'Already liked' : 'Like moment'}
            aria-pressed={liked}
          >
            <Heart
              size={18}
              className={`transition ${liked ? '' : 'group-hover:scale-110'}`}
              fill={liked || moment.likeCount > 0 ? '#9d2131' : 'transparent'}
            />
            {moment.likeCount}
          </button>
          <time className="text-xs text-muted" dateTime={moment.createdAt}>
            {formatRelativeTime(moment.createdAt)}
          </time>
        </div>
      </div>
    </article>
  )
}
