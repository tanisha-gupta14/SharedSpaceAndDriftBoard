import type { AppView } from '../types'

interface NavbarProps {
  view: AppView
  onViewChange: (view: AppView) => void
  showBack?: boolean
  onBack?: () => void
  detailTitle?: string | null
}

export function Navbar({ view, onViewChange, showBack, onBack, detailTitle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-0">
        <div className="flex min-w-0 items-center gap-3 sm:flex-1">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-charcoal transition hover:bg-milky-pink"
            >
              ← Back
            </button>
          ) : (
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-burgundy sm:text-[1.65rem]">
              LittleWorld
            </h1>
          )}
          {showBack && detailTitle && (
            <p className="truncate font-display text-lg font-bold text-burgundy">{detailTitle}</p>
          )}
        </div>

        {!showBack && (
          <nav
            className="flex items-center justify-center gap-1 self-center rounded-full bg-milky-pink/70 p-1 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
            aria-label="Main views"
          >
            <TabButton
              active={view === 'shared-space'}
              onClick={() => onViewChange('shared-space')}
              label="Shared Space"
            />
            <TabButton
              active={view === 'vibe-board'}
              onClick={() => onViewChange('vibe-board')}
              label="Vibe Board"
            />
          </nav>
        )}

        <div className="hidden sm:block sm:flex-1" />
      </div>
    </header>
  )
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? 'bg-pastel-yellow font-bold text-gray-800 shadow-sm'
          : 'font-medium text-charcoal hover:text-burgundy'
      }`}
    >
      {label}
    </button>
  )
}
