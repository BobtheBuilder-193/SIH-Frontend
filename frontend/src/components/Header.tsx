import { SatelliteIcon } from './icons'
import { StatusBadge } from './StatusBadge'
import { apiMode } from '@/api'
import type { StartRole } from '@/pages/Landing'

const ROLE_LABEL: Record<StartRole, string> = {
  researcher: 'Researcher mode',
  explore: 'Explore mode',
}

export function Header({
  backendOnline,
  startRole,
  onChangeMode,
}: {
  backendOnline: boolean | null
  startRole?: StartRole
  onChangeMode?: () => void
}) {
  return (
    <header className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-panel)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] text-[var(--color-accent)]">
            <SatelliteIcon width={18} height={18} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                GeoLens
              </h1>
              <span className="hidden text-xs text-[var(--color-text-muted)] sm:inline">
                SIH26167
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Evidence-first analysis for satellite imagery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {startRole && <StatusBadge kind="neutral" label={ROLE_LABEL[startRole]} />}
          {apiMode === 'mock' && (
            <StatusBadge kind="neutral" label="Demo mode" />
          )}
          {backendOnline === null ? (
            <StatusBadge kind="pending" label="Checking backend" />
          ) : backendOnline ? (
            <StatusBadge kind="success" label="Backend connected" />
          ) : (
            <StatusBadge kind="error" label="Backend unreachable" />
          )}
          {onChangeMode && (
            <button
              type="button"
              onClick={onChangeMode}
              className="text-xs text-[var(--color-text-muted)] underline decoration-[var(--color-border-strong)] underline-offset-2 hover:text-[var(--color-text-secondary)]"
            >
              Change mode
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
