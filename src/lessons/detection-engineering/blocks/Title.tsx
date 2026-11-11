import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { SplitWords } from '@/motion'
import { SectorLight } from '../SectorLight'

/**
 * Title slide: the cartouche on the left, one sector light filling the
 * right. The overline sits inside the cartouche frame as the chart's
 * producer line, beneath the title, not above it.
 */
export function Title({ block, mode, Default }: BlockOverrideProps<TitleBlock>) {
  if (mode !== 'slide') return <Default block={block} mode={mode} />
  return (
    <section className="block block--title de-title">
      <div className="de-title__cartouche">
        <h1 className="block--title__h de-title__h">{block.title}</h1>
        <p className="de-title__overline">{block.overline}</p>
        {block.lead && (
          <p className="block--title__lead de-title__lead">
            {/* Read as one sentence; the per-word spans exist only to stagger. */}
            <span className="sr-only">{block.lead}</span>
            <span aria-hidden="true">
              <SplitWords as="span" className="de-title__words" text={block.lead} />
            </span>
          </p>
        )}
      </div>
      <div className="de-title__art" aria-hidden="true">
        <SectorLight />
      </div>
    </section>
  )
}
