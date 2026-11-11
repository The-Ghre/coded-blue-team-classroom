import type { CSSProperties } from 'react'
import type { CompareBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Callout } from '@/components/brand/Brand'
import { Detail, Footer, Head, carpetOf } from './parts'

/* =========================================================================
   COMPARE — two carpets, one threshold
   =========================================================================
   The question is the same on both sides; only where to look changes. So
   each row's label sits on the brass strip between the carpets, and each
   platform's answer lies on its own carpet. Semantically it is still a
   table: ARIA table roles keep row and column headers announced, and the
   row header comes first in the DOM; the grid places it between the cells.

   Blocks with anything other than two columns render through the shared
   component.
   ========================================================================= */

export function Compare(props: BlockOverrideProps<CompareBlock>) {
  const { block, mode, Default } = props
  if (block.columns.length !== 2) return <Default block={block} mode={mode} />
  const carpets = block.columns.map((c, i) => carpetOf(c.label) ?? (i === 0 ? 'windows' : 'linux'))

  return (
    <section className="block block--compare hf-compare">
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className="hf-floor" role="table" aria-label={block.title}>
        <div className="hf-floor__row hf-floor__row--head" role="row">
          <div className="hf-floor__strip hf-floor__strip--head" role="columnheader">
            <span className="sr-only">Question</span>
          </div>
          <div className={`hf-floor__cell hf-floor__colhead hf-carpet hf-carpet--${carpets[0]}`} role="columnheader">
            {block.columns[0].label}
          </div>
          <div className={`hf-floor__cell hf-floor__colhead hf-carpet hf-carpet--${carpets[1]}`} role="columnheader">
            {block.columns[1].label}
          </div>
        </div>

        {block.rows.map((row, r) => (
          <div className="hf-floor__row" role="row" key={row.label} style={{ '--r': r } as CSSProperties}>
            <div className="hf-floor__strip" role="rowheader">
              <strong className="hf-floor__plaque">
                {row.label}
                <span className="hf-sep">:</span>
              </strong>
            </div>
            <div className={`hf-floor__cell hf-floor__cell--a hf-carpet hf-carpet--${carpets[0]}`} role="cell">
              <span className="hf-floor__mobile-label" aria-hidden="true">
                {block.columns[0].label}
                <span className="hf-sep">: </span>
              </span>
              {row.cells[0]}
            </div>
            <div className={`hf-floor__cell hf-floor__cell--b hf-carpet hf-carpet--${carpets[1]}`} role="cell">
              <span className="hf-floor__mobile-label" aria-hidden="true">
                {block.columns[1].label}
                <span className="hf-sep">: </span>
              </span>
              {row.cells[1]}
            </div>
          </div>
        ))}
      </div>

      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
