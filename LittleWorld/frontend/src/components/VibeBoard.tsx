import type { BoardSummary } from '../types'
import { formatRelativeTime } from '../lib/images'
import { BoardCollage } from './BoardCollage'

interface VibeBoardProps {
  boards: BoardSummary[]
  loading: boolean
  error: string | null
  onOpenBoard: (id: string) => void
}

export function VibeBoard({ boards, loading, error, onOpenBoard }: VibeBoardProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 animate-fade-up">
        <h2 className="font-display text-2xl font-bold text-burgundy">Vibe boards</h2>
        <p className="mt-1 text-sm text-muted">
          Clusters discovered from shared moments — updated live as the world shifts.
        </p>
      </div>

      {loading && (
        <p className="text-center text-sm text-muted animate-soft-pulse">Discovering vibes…</p>
      )}
      {error && (
        <p className="mb-6 rounded-2xl bg-burgundy/10 px-4 py-3 text-center text-sm text-burgundy">
          {error}
        </p>
      )}
      {!loading && !error && boards.length === 0 && (
        <div className="mx-auto max-w-md py-16 text-center animate-fade-up">
          <p className="font-display text-xl font-bold text-burgundy">No boards yet</p>
          <p className="mt-2 text-sm text-muted">
            Once moments are processed, related ones gather here automatically.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board, i) => (
          <button
            key={board.id}
            type="button"
            onClick={() => onOpenBoard(board.id)}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            className="animate-fade-up group overflow-hidden rounded-3xl bg-white text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[4/3]">
              <BoardCollage
                urls={board.previewImageUrls ?? []}
                className="h-full w-full"
              />
              <span className="absolute right-3 top-3 rounded-full bg-pastel-yellow px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
                {board.memberCount} {board.memberCount === 1 ? 'moment' : 'moments'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-display text-lg font-bold text-gray-800 transition group-hover:text-burgundy">
                {board.name?.trim() || 'Untitled'}
              </h3>
              <p className="mt-1 text-xs text-muted">
                Opened {formatRelativeTime(board.createdAt)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
