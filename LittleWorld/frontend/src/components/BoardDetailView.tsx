import { useEffect, useMemo, useState } from 'react'
import { getBoard } from '../api'
import type { BoardDetail, Moment } from '../types'
import { MomentCard } from './MomentCard'

interface BoardDetailViewProps {
  boardId: string
  /** Live feed moments — used to sync like counts from WebSocket / shared likes */
  liveMoments: Moment[]
  likedIds: Set<string>
  onLike: (id: string) => Promise<void>
}

export function BoardDetailView({ boardId, liveMoments, likedIds, onLike }: BoardDetailViewProps) {
  const [board, setBoard] = useState<BoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getBoard(boardId)
      .then((data) => {
        if (!cancelled) setBoard(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load board')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [boardId])

  const members = useMemo(() => {
    if (!board) return []
    const liveById = new Map(liveMoments.map((m) => [m.id, m]))
    return board.members.map((member) => {
      const live = liveById.get(member.id)
      if (!live) return member
      return {
        ...member,
        likeCount: Math.max(member.likeCount, live.likeCount),
        status: live.status,
        userCaption: live.userCaption ?? member.userCaption,
      }
    })
  }, [board, liveMoments])

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-muted animate-soft-pulse">Opening board…</p>
    )
  }
  if (error || !board) {
    return (
      <p className="mx-auto max-w-md py-20 text-center text-sm text-burgundy">
        {error || 'Board not found'}
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 animate-fade-up">
        <div className="mb-2 inline-flex rounded-full bg-pastel-yellow px-3 py-1 text-xs font-bold text-gray-800">
          {board.memberCount} {board.memberCount === 1 ? 'member' : 'members'}
        </div>
        <h2 className="font-display text-3xl font-bold text-burgundy">
          {board.name?.trim() || 'Untitled'}
        </h2>
        <p className="mt-1 text-sm text-muted">Moments that found the same frequency.</p>
      </div>

      {members.length === 0 ? (
        <p className="text-center text-sm text-muted">No members on this board yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((moment, i) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onLike={onLike}
              liked={likedIds.has(moment.id)}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
