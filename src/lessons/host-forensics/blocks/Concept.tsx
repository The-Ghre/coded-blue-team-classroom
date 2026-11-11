import type { CSSProperties } from 'react'
import type { ConceptBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Callout, RedBlue } from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import { Detail, Footer, Head, Print, carpetOf, splitPrefix, splitQuestion, type Carpet } from './parts'

/* =========================================================================
   CONCEPT — two structural forms, chosen from the content itself
   =========================================================================
   Question points ("What ran? …") become a stride: one footprint per
   question, alternating feet, in the order an investigation walks them.

   Platform points ("Windows: …", "Linux: …", "What survives on both: …")
   are laid on their own carpet either side of the threshold, with the
   points that hold for both sitting on the strip itself.

   Anything else renders through the shared component.
   ========================================================================= */

function isStride(points: string[]) {
  return points.length >= 3 && points.every((p) => /^what\b[^?]{0,80}\?/i.test(p))
}

function platformOf(point: string): Carpet | null {
  const { prefix } = splitPrefix(point)
  return prefix ? carpetOf(prefix) : null
}

function isSplit(points: string[]) {
  const tagged = points.map(platformOf)
  return tagged.filter(Boolean).length >= Math.max(3, points.length - 1)
}

function Tail({ block, mode }: BlockOverrideProps<ConceptBlock>) {
  return (
    <>
      {block.diagram && <Diagram spec={block.diagram} />}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </>
  )
}

function Stride(props: BlockOverrideProps<ConceptBlock>) {
  const { block } = props
  return (
    <section className="block block--concept hf-stride">
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <ol className="hf-stride__steps">
        {block.points.map((p, i) => {
          const { q, gloss } = splitQuestion(p)
          const side = i % 2 === 0 ? -1 : 1
          return (
            <li key={i} className="hf-stride__step" data-foot={side < 0 ? 'left' : 'right'} style={{ '--i': i } as CSSProperties}>
              <Print side={side} className="hf-stride__print">
                <span className="hf-stride__num">{i + 1}</span>
              </Print>
              <p className="hf-stride__text">
                <strong className="hf-stride__q">{q}</strong>
                {gloss && <span className="hf-stride__gloss"> {gloss}</span>}
              </p>
            </li>
          )
        })}
      </ol>
      <Tail {...props} />
    </section>
  )
}

const CARPET_NAME: Record<Exclude<Carpet, 'both'>, string> = { windows: 'Windows', linux: 'Linux' }

function Split(props: BlockOverrideProps<ConceptBlock>) {
  const { block } = props
  const items = block.points.map((p, i) => ({ i, p, carpet: platformOf(p) ?? 'both' }))
  const col = (c: Carpet) => items.filter((it) => it.carpet === c)
  const renderPoint = ({ i, p }: { i: number; p: string }) => {
    const { prefix, body } = splitPrefix(p)
    return (
      <li key={i} className="hf-split__point" style={{ '--i': i } as CSSProperties}>
        {prefix && <span className="hf-split__prefix">{prefix}:</span>} {body}
      </li>
    )
  }
  return (
    <section className="block block--concept hf-split">
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="hf-split__floor">
        {(['windows', 'linux'] as const).map((c) => (
          <div key={c} className={`hf-split__carpet hf-carpet hf-carpet--${c}`}>
            <h3 className="hf-carpet__label">{CARPET_NAME[c]}</h3>
            <ul>{col(c).map(renderPoint)}</ul>
          </div>
        ))}
        {col('both').length > 0 && (
          <div className="hf-split__strip">
            <h3 className="hf-carpet__label hf-carpet__label--strip">Both platforms</h3>
            <ul>{col('both').map(renderPoint)}</ul>
          </div>
        )}
      </div>
      <Tail {...props} />
    </section>
  )
}

export function Concept(props: BlockOverrideProps<ConceptBlock>) {
  const { block, mode, Default } = props
  if (isStride(block.points)) return <Stride {...props} />
  if (isSplit(block.points)) return <Split {...props} />
  return <Default block={block} mode={mode} />
}
