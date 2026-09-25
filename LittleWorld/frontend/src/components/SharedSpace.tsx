import { Camera } from 'lucide-react'
import { useState } from 'react'
import type { Moment } from '../types'
import { MomentCard } from './MomentCard'
import { UploadModal } from './UploadModal'

interface SharedSpaceProps {
  moments: Moment[]
  loading: boolean
  error: string | null
  likedIds: Set<string>
  onLike: (id: string) => Promise<void>
  onUpload: (payload: { file: File; caption: string }) => Promise<void>
}

export function SharedSpace({
  moments,
  loading,
  error,
  likedIds,
  onLike,
  onUpload,
}: SharedSpaceProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState('')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto mb-10 max-w-xl animate-fade-up">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setModalOpen(true)
              }
            }}
            onFocus={() => setModalOpen(true)}
            placeholder="What's on your mind today?"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-muted"
            readOnly
          />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy text-white transition hover:bg-burgundy-dark"
            aria-label="Upload a moment"
          >
            <Camera size={18} />
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-center text-sm text-muted animate-soft-pulse">Loading the shared space…</p>
      )}
      {error && (
        <p className="mx-auto mb-6 max-w-lg rounded-2xl bg-burgundy/10 px-4 py-3 text-center text-sm text-burgundy">
          {error}
        </p>
      )}
      {!loading && !error && moments.length === 0 && (
        <div className="mx-auto max-w-md animate-fade-up py-16 text-center">
          <p className="font-display text-xl font-bold text-burgundy">The space is quiet</p>
          <p className="mt-2 text-sm text-muted">Share the first moment and watch the feed come alive.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {moments.map((moment, i) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            onLike={onLike}
            liked={likedIds.has(moment.id)}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          />
        ))}
      </div>

      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCaption={draft}
        onSubmit={async (payload) => {
          await onUpload(payload)
          setDraft('')
        }}
      />
    </div>
  )
}
