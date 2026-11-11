import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import type { ConceptBlock as ConceptBlockType, DiagramSpec } from '@/types/content'
import type { BlockOverrideProps } from '../types'
import { Callout, MonoLabel, RedBlue } from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import { BlockHead, Detail, Footer } from './shared'

/* =========================================================================
   CONCEPT — with the two diagrams this lesson's world redraws
   =========================================================================
   Tiers become a relay line: one alert tag travels the line, stopping at
   each desk for that desk's one question, is handed on, and returns to
   Tier 1 by the feedback loop under the line.

   The pipeline becomes a line tags travel along. Some never reach the end:
   they vanish at the collector without a sound, which is the stage the
   lesson names as the silent failure point.

   Both keep the shared diagram's frame: label, visible "Describe this
   diagram" toggle, and the same text alternative.
   ========================================================================= */

function Frame({ alt, label, children }: { alt: string; label: string; children: ReactNode }) {
  const [showAlt, setShowAlt] = useState(false)
  const altId = useId()
  return (
    <figure className="diagram soc-diagram">
      <div className="diagram__head">
        <MonoLabel>{label}</MonoLabel>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          aria-expanded={showAlt}
          aria-controls={altId}
          onClick={() => setShowAlt((v) => !v)}
        >
          {showAlt ? 'Hide description' : 'Describe this diagram'}
        </button>
      </div>
      <div className="diagram__body" role="img" aria-label={alt}>
        {children}
      </div>
      <figcaption id={altId} className={showAlt ? 'diagram__alt' : 'sr-only'}>
        {alt}
      </figcaption>
    </figure>
  )
}

function Relay({ spec }: { spec: Extract<DiagramSpec, { type: 'tiers' }> }) {
  const n = spec.tiers.length
  return (
    <Frame alt={spec.alt} label="Handover chain">
      <div className="soc-relay" style={{ '--n': n } as CSSProperties}>
        <ol className="soc-relay__line">
          {spec.tiers.map((tier, i) => (
            <li key={tier.label} className="soc-relay__desk" style={{ '--i': i } as CSSProperties}>
              <span className="soc-relay__stop" aria-hidden="true" />
              <h4 className="soc-relay__label">{tier.label}</h4>
              <p className="soc-relay__question">{tier.question}</p>
              <p className="soc-relay__hands">
                <span className="soc-relay__hands-key">Hands on</span>
                {tier.handsOff}
              </p>
            </li>
          ))}
        </ol>
        <span className="soc-relay__token" aria-hidden="true" />
        <svg className="soc-relay__loop" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 940 4 C 940 52, 900 54, 820 54 L 180 54 C 100 54, 60 52, 60 8" />
          <path className="soc-relay__arrow" d="M 50 20 L 60 6 L 70 20" />
        </svg>
      </div>
    </Frame>
  )
}

function Flow({ spec }: { spec: Extract<DiagramSpec, { type: 'pipeline' }> }) {
  const n = spec.stages.length
  const collector = spec.stages.findIndex((s) => /silent/i.test(s.note))
  return (
    <Frame alt={spec.alt} label="Pipeline">
      <div className="soc-flow" style={{ '--n': n, '--drop': Math.max(collector, 1) } as CSSProperties}>
        <ol className="soc-flow__stages">
          {spec.stages.map((stage, i) => (
            <li key={stage.label} className="soc-flow__stage" data-silent={i === collector}>
              <span className="soc-flow__stop" aria-hidden="true" />
              <span className="soc-flow__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h4 className="soc-flow__label">{stage.label}</h4>
              <p className="soc-flow__note">{stage.note}</p>
            </li>
          ))}
        </ol>
        <span className="soc-flow__lane" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((k) => (
            <span
              key={k}
              className="soc-flow__tag"
              data-lost={k === 2}
              style={{ '--k': k } as CSSProperties}
            />
          ))}
        </span>
      </div>
    </Frame>
  )
}

export function ConceptBlock({ block, mode }: BlockOverrideProps<ConceptBlockType>) {
  const d = block.diagram
  return (
    <section className="block block--concept soc-concept" data-diagram={d?.type}>
      <BlockHead block={block} kicker="Concept" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <ul className="concept__points">
        {block.points.map((p, i) => (
          <li key={i}>
            <span className="concept__bullet" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {d &&
        (d.type === 'tiers' ? (
          <Relay spec={d} />
        ) : d.type === 'pipeline' ? (
          <Flow spec={d} />
        ) : (
          <Diagram spec={d} />
        ))}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
