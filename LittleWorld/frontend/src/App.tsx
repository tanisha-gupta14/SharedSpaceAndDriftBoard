import { useCallback, useEffect, useRef, useState } from 'react'
import { getBoards, getRecentMoments, likeMoment, uploadMoment } from './api'
import { BoardDetailView } from './components/BoardDetailView'
import { Navbar } from './components/Navbar'
import { SharedSpace } from './components/SharedSpace'
import { VibeBoard } from './components/VibeBoard'
import { useRealtime } from './hooks/useRealtime'
import { loadLikedInTab, markLikedInTab, unmarkLikedInTab } from './lib/liked'
import type { AppView, BoardSummary, Moment } from './types'

const BOARD_REFETCH_DEBOUNCE_MS = 500

function upsertMoment(list: Moment[], incoming: Moment): Moment[] {
  const idx = list.findIndex((m) => m.id === incoming.id)
  if (idx === -1) return [incoming, ...list]
  const next = [...list]
  const existing = next[idx]
  next[idx] = {
    ...existing,
    ...incoming,
    // Never let a stale WS/API payload shrink the count we already show
    likeCount: Math.max(existing.likeCount, incoming.likeCount),
  }
  return next
}

function resolvePreviewUrls(
  incoming: string[] | null | undefined,
  existing: string[] | null | undefined,
): string[] {
  if (incoming && incoming.length > 0) return incoming
  if (existing && existing.length > 0) return existing
  return incoming ?? existing ?? []
}

function upsertBoard(list: BoardSummary[], incoming: BoardSummary): BoardSummary[] {
  const idx = list.findIndex((b) => b.id === incoming.id)
  if (idx === -1) {
    return [
      {
        ...incoming,
        previewImageUrls: incoming.previewImageUrls ?? [],
      },
      ...list,
    ]
  }
  const next = [...list]
  next[idx] = {
    ...next[idx],
    ...incoming,
    previewImageUrls: resolvePreviewUrls(
      incoming.previewImageUrls,
      next[idx].previewImageUrls,
    ),
  }
  return next.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export default function App() {
  const [view, setView] = useState<AppView>('shared-space')
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  const [moments, setMoments] = useState<Moment[]>([])
  const [momentsLoading, setMomentsLoading] = useState(true)
  const [momentsError, setMomentsError] = useState<string | null>(null)

  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [boardsLoading, setBoardsLoading] = useState(true)
  const [boardsError, setBoardsError] = useState<string | null>(null)

  const [likedIds, setLikedIds] = useState<Set<string>>(() => loadLikedInTab())

  const boardRefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refetchBoards = useCallback(async (opts?: { showLoading?: boolean }) => {
    if (opts?.showLoading) setBoardsLoading(true)
    try {
      const data = await getBoards()
      setBoards(data)
      setBoardsError(null)
    } catch (err: unknown) {
      setBoardsError(err instanceof Error ? err.message : 'Failed to load boards')
    } finally {
      if (opts?.showLoading) setBoardsLoading(false)
    }
  }, [])

  const scheduleBoardRefetch = useCallback(() => {
    if (boardRefetchTimer.current) clearTimeout(boardRefetchTimer.current)
    boardRefetchTimer.current = setTimeout(() => {
      boardRefetchTimer.current = null
      void refetchBoards()
    }, BOARD_REFETCH_DEBOUNCE_MS)
  }, [refetchBoards])

  useEffect(() => {
    return () => {
      if (boardRefetchTimer.current) clearTimeout(boardRefetchTimer.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setMomentsLoading(true)
    getRecentMoments()
      .then((data) => {
        if (!cancelled) {
          setMoments(data)
          setMomentsError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMomentsError(err instanceof Error ? err.message : 'Failed to load moments')
        }
      })
      .finally(() => {
        if (!cancelled) setMomentsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    void refetchBoards({ showLoading: true })
  }, [refetchBoards])

  // Refresh collages when opening Vibe Board (covers missed/empty WS payloads)
  useEffect(() => {
    if (view !== 'vibe-board') return
    void refetchBoards()
  }, [view, refetchBoards])

  const handleMomentEvent = useCallback((moment: Moment) => {
    setMoments((prev) => upsertMoment(prev, moment))
  }, [])

  const handleBoardEvent = useCallback(
    (board: BoardSummary) => {
      setBoards((prev) => upsertBoard(prev, board))
      scheduleBoardRefetch()
    },
    [scheduleBoardRefetch],
  )

  useRealtime({ onMoment: handleMomentEvent, onBoard: handleBoardEvent })

  async function handleLike(id: string) {
    if (likedIds.has(id)) return

    markLikedInTab(id)
    setLikedIds((prev) => new Set(prev).add(id))

    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likeCount: m.likeCount + 1 } : m)),
    )
    try {
      const updated = await likeMoment(id)
      setMoments((prev) => upsertMoment(prev, updated))
    } catch {
      setMoments((prev) =>
        prev.map((m) => (m.id === id ? { ...m, likeCount: Math.max(0, m.likeCount - 1) } : m)),
      )
      unmarkLikedInTab(id)
      setLikedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  async function handleUpload(payload: { file: File; caption: string }) {
    const created = await uploadMoment(payload.file, payload.caption || undefined)
    setMoments((prev) => upsertMoment(prev, created))
  }

  const showDetail = view === 'vibe-board' && selectedBoardId
  const selectedBoard = boards.find((b) => b.id === selectedBoardId)

  return (
    <div className="min-h-screen bg-milky-pink">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 10% -10%, rgba(252,224,139,0.55), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(157,33,49,0.12), transparent)',
        }}
      />

      <Navbar
        view={view}
        onViewChange={(next) => {
          setView(next)
          setSelectedBoardId(null)
        }}
        showBack={Boolean(showDetail)}
        onBack={() => setSelectedBoardId(null)}
        detailTitle={selectedBoard?.name?.trim() || (showDetail ? 'Untitled' : null)}
      />

      <main>
        {view === 'shared-space' && (
          <SharedSpace
            moments={moments}
            loading={momentsLoading}
            error={momentsError}
            likedIds={likedIds}
            onLike={handleLike}
            onUpload={handleUpload}
          />
        )}

        {view === 'vibe-board' && !selectedBoardId && (
          <VibeBoard
            boards={boards}
            loading={boardsLoading}
            error={boardsError}
            onOpenBoard={setSelectedBoardId}
          />
        )}

        {view === 'vibe-board' && selectedBoardId && (
          <BoardDetailView
            boardId={selectedBoardId}
            liveMoments={moments}
            likedIds={likedIds}
            onLike={handleLike}
          />
        )}
      </main>
    </div>
  )
}
