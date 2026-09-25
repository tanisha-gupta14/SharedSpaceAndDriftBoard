const LIKED_KEY = 'littleworld:liked'

function readLikedIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(LIKED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

function writeLikedIds(ids: Set<string>) {
  try {
    sessionStorage.setItem(LIKED_KEY, JSON.stringify([...ids]))
  } catch {
    /* ignore quota / private mode */
  }
}

export function hasLikedInTab(momentId: string): boolean {
  return readLikedIds().has(momentId)
}

export function markLikedInTab(momentId: string) {
  const ids = readLikedIds()
  ids.add(momentId)
  writeLikedIds(ids)
}

export function loadLikedInTab(): Set<string> {
  return readLikedIds()
}

export function unmarkLikedInTab(momentId: string) {
  const ids = readLikedIds()
  ids.delete(momentId)
  writeLikedIds(ids)
}
