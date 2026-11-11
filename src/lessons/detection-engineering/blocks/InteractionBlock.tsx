import type { InteractionBlock as Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { MonoLabel } from '@/components/brand/Brand'
import { KitBoundary } from '../../LessonContext'
import { Interaction } from '@/components/interactions/Interaction'
import { Detail, Footer, Head } from './shared'
import { SectorTuner } from '../interactions/SectorTuner'
import { CoastChart } from '../interactions/CoastChart'

/**
 * The interaction block, keeping every part of the shared renderer (title,
 * lead, what it teaches, the exercise, study depth, provenance), with this
 * lesson's two exercises in their chart form. If either throws, the shared
 * exercise renders in its place.
 */
export function InteractionBlock({ block, mode }: BlockOverrideProps<Block>) {
  const fallback = <Interaction component={block.component} data={block.data} />
  let exercise = fallback
  if (block.component === 'rule-builder') exercise = <SectorTuner data={block.data} />
  if (block.component === 'coverage-map') exercise = <CoastChart data={block.data} />

  return (
    <section className="block block--interaction de-ix" data-component={block.component}>
      <Head block={block} />
      {block.lead && <p className="lead de-lead">{block.lead}</p>}
      <div className="interaction__teaches de-teaches">
        <MonoLabel>What this teaches</MonoLabel>
        <p>{block.teaches}</p>
      </div>
      <KitBoundary label={`detection-engineering ${block.component}`} fallback={fallback}>
        {exercise}
      </KitBoundary>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
