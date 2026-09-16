import { useEffect, useState } from 'react'
import { apiClient } from '@/api'
import { Layout } from '@/components/Layout'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Panel, PanelHeader } from '@/components/Panel'
import { EmptyState } from '@/components/EmptyState'
import { HelpPanel } from '@/components/HelpPanel'
import { ImageCard } from '@/components/ImageCard'
import { ImageIcon, CompassIcon } from '@/components/icons'
import { GeospatialMapViewer } from '@/components/GeospatialMapViewer'
import { UploadDropzone } from '@/features/upload/UploadDropzone'
import { QueryComposer } from '@/features/analysis/QueryComposer'
import { AnalysisStatusPanel } from '@/features/analysis/AnalysisStatusPanel'
import { AnalysisSummaryPanel } from '@/features/analysis/AnalysisSummaryPanel'
import { DemoSelector } from '@/features/demo/DemoSelector'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useAnalysis } from '@/hooks/useAnalysis'
import type { StartRole } from '@/pages/Landing'
import type { DemoSample } from '@/types/demo'

interface AppProps {
  /** How the visitor entered — picked on the landing page. Optional so App still renders standalone. */
  startRole?: StartRole
  /** Sends the visitor back to the landing page to pick again. */
  onChangeMode?: () => void
}

export function App({ startRole, onChangeMode }: AppProps) {
  const { images, addFiles, stageDemoImages, removeImage, clearImages } = useImageUpload()
  const { result, isAnalyzing, error, runQuery, reset } = useAnalysis()
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [showDemoSelector, setShowDemoSelector] = useState(startRole === 'explore')
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState('')

  useEffect(() => {
    apiClient
      .checkBackendStatus()
      .then((status) => setBackendOnline(status.online))
      .catch(() => setBackendOnline(false))
  }, [])

  const readyImages = images.filter((img) => img.stage === 'ready')
  const hasReadyImages = readyImages.length > 0

  function handleSubmitQuery(prompt: string) {
    runQuery(
      prompt,
      readyImages.map((img) => img.id),
    )
  }

  function handleSelectDemoSample(sample: DemoSample) {
    setActiveDemoId(sample.id)
    stageDemoImages(sample.images)
    setCurrentPrompt(sample.defaultQuery)
    reset()
  }

  return (
    <Layout
      header={
        <Header
          backendOnline={backendOnline}
          startRole={startRole}
          onChangeMode={onChangeMode}
        />
      }
      main={
        <>
          {/* Demo Scenario Selector (Master Prompt Section 21) */}
          {(showDemoSelector || startRole === 'explore') && (
            <DemoSelector
              onSelectSample={handleSelectDemoSample}
              activeSampleId={activeDemoId}
            />
          )}

          {/* Imagery Ingestion Panel */}
          <Panel>
            <PanelHeader
              title="Remote Sensing Imagery"
              subtitle="Drop single scenes, bi-temporal epochs, or Optical + SAR pairs"
              action={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDemoSelector((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:border-[var(--color-accent)]/50"
                  >
                    <CompassIcon width={12} height={12} />
                    <span>{showDemoSelector ? 'Hide Demo Datasets' : 'Explore Demo Datasets'}</span>
                  </button>
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={clearImages}
                      className="text-xs text-[var(--color-text-muted)] underline decoration-[var(--color-border)] underline-offset-2 hover:text-[var(--color-error)]"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              }
            />

            <div className="space-y-4 p-4">
              <UploadDropzone onFiles={addFiles} />

              {images.length === 0 ? (
                <EmptyState
                  icon={<ImageIcon width={18} height={18} />}
                  title="Nothing uploaded yet"
                  description="Drop GeoTIFF, optical, multispectral, or SAR scenes above, or pick a demo dataset."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {images.map((image) => (
                    <ImageCard key={image.id} image={image} onRemove={removeImage} />
                  ))}
                </div>
              )}
            </div>
          </Panel>

          {/* Natural Language Query Composer (Master Prompt Section 9) */}
          <Panel className="p-4">
            <QueryComposer
              disabled={!hasReadyImages}
              isAnalyzing={isAnalyzing}
              onSubmit={handleSubmitQuery}
              initialPrompt={currentPrompt}
            />
          </Panel>

          {/* Result Hierarchy & Polymorphic Evidence System (Sections 12 - 17) */}
          {result && (
            <AnalysisSummaryPanel
              result={result}
              defaultImageUrl={readyImages[0]?.remotePreviewUrl ?? readyImages[0]?.previewUrl}
              onReset={reset}
            />
          )}
        </>
      }
      sidebar={
        <Sidebar>
          {/* Observable Execution Trace Timeline (Section 11) */}
          <AnalysisStatusPanel
            result={result}
            isAnalyzing={isAnalyzing}
            error={error}
          />

          {/* Spatial Map HUD Layer */}
          <GeospatialMapViewer crs={readyImages[0]?.metadata.crs} />

          {/* Operational Guidance */}
          <HelpPanel />
        </Sidebar>
      }
    />
  )
}

export default App
