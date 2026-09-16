import { useEffect, useState } from 'react'
import { apiClient } from '@/api'
import type { DemoSample } from '@/types/demo'
import { Panel, PanelHeader } from '@/components/Panel'
import { StatusBadge } from '@/components/StatusBadge'
import { CompassIcon, ScanIcon, LayersIcon } from '@/components/icons'

interface DemoSelectorProps {
  onSelectSample: (sample: DemoSample) => void
  activeSampleId?: string | null
}

const WORKFLOW_ICONS = {
  cross_modal: CompassIcon,
  grounding: ScanIcon,
  change_detection: LayersIcon,
  vqa: LayersIcon,
}

export function DemoSelector({ onSelectSample, activeSampleId }: DemoSelectorProps) {
  const [samples, setSamples] = useState<DemoSample[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiClient
      .getDemoSamples()
      .then((data) => setSamples(data))
      .catch((err) => console.error('Failed to load demo samples:', err))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading || samples.length === 0) return null

  return (
    <Panel className="border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)]/20">
      <PanelHeader
        title="Interactive Demo Scenarios"
        subtitle="One-click stage pre-configured multimodal satellite datasets & starter queries"
        action={<StatusBadge kind="neutral" label="Demo Datasets" />}
      />

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
        {samples.map((sample) => {
          const Icon = WORKFLOW_ICONS[sample.targetWorkflow] || CompassIcon
          const isActive = activeSampleId === sample.id

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`group flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? 'border-[var(--color-accent)] bg-[var(--color-panel-raised)] shadow-[0_0_12px_rgba(224,138,91,0.2)]'
                  : 'border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-panel-raised)]'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-panel-raised)] text-[var(--color-accent)] group-hover:border-[var(--color-accent)]/40">
                  <Icon width={14} height={14} />
                </span>
                <span className="font-mono-tabular text-[10px] text-[var(--color-text-muted)]">
                  {sample.images.length} {sample.images.length === 1 ? 'scene' : 'scenes'}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {sample.title}
                </p>
                <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="mt-1 flex w-full items-center justify-between border-t border-[var(--color-border)]/60 pt-2 text-[10px]">
                <span className="text-[var(--color-accent)] font-medium">Load Scenario →</span>
                <span className="text-[var(--color-text-muted)] capitalize">
                  {sample.targetWorkflow.replace('_', ' ')}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
