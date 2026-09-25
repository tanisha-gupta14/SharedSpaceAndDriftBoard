export function resolveImageSrc(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('blob:') ||
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('/')
  ) {
    return imageUrl
  }

  return null
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  if (Number.isNaN(diffMs)) return ''

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
