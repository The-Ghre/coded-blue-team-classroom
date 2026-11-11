import { useId, useState } from 'react'
import type { DiagramSpec } from '@/types/content'
import { MonoLabel, PillarTag } from '@/components/brand/Brand'

/* =========================================================================
   DIAGRAMS
   =========================================================================
   Every diagram here is laid out with CSS grid and flow rather than drawn
   at fixed SVG coordinates, so it reflows on a phone instead of scrolling
   sideways, and it reads correctly in a screen reader as structured text.
   Each carries an explicit text alternative which is both the accessible
   description and a visible, expandable one — a student who cannot parse
   the picture gets the same information, not a worse version of it.
   ========================================================================= */

function DiagramFrame({
  alt,
  label,
  children,
}: {
  alt: string
  label: string
  children: React.ReactNode
}) {
  const [showAlt, setShowAlt] = useState(false)
  const altId = useId()

  return (
    <figure className="diagram">
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

/* ---------- Pipeline: linear stages with a flow between them ------------- */

function Pipeline({ spec }: { spec: Extract<DiagramSpec, { type: 'pipeline' }> }) {
  return (
    <DiagramFrame alt={spec.alt} label="Pipeline">
      <ol className="dg-pipeline">
        {spec.stages.map((stage, i) => (
          <li key={stage.label} className="dg-pipeline__stage">
            <div className="dg-pipeline__num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="dg-pipeline__label">{stage.label}</div>
            <p className="dg-pipeline__note">{stage.note}</p>
            {i < spec.stages.length - 1 && (
              <span className="dg-pipeline__arrow" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </DiagramFrame>
  )
}

/* ---------- Tiers: a handover chain that loops back --------------------- */

function Tiers({ spec }: { spec: Extract<DiagramSpec, { type: 'tiers' }> }) {
  return (
    <DiagramFrame alt={spec.alt} label="Handover chain">
      <ol className="dg-tiers">
        {spec.tiers.map((tier, i) => (
          <li key={tier.label} className="dg-tiers__tier">
            <div className="dg-tiers__bar" aria-hidden="true" />
            <div className="dg-tiers__content">
              <h4 className="dg-tiers__label">{tier.label}</h4>
              <p className="dg-tiers__question">“{tier.question}”</p>
              <p className="dg-tiers__hands">
                <span className="dg-tiers__hands-glyph" aria-hidden="true">
                  ↳
                </span>
                {tier.handsOff}
              </p>
            </div>
            {i === spec.tiers.length - 1 && (
              <div className="dg-tiers__loop" aria-hidden="true">
                ↺ back to the start
              </div>
            )}
          </li>
        ))}
      </ol>
    </DiagramFrame>
  )
}

/* ---------- Pillars: parallel coverage with explicit blind spots -------- */

function Pillars({ spec }: { spec: Extract<DiagramSpec, { type: 'pillars' }> }) {
  return (
    <DiagramFrame alt={spec.alt} label="Telemetry pillars">
      <div className="dg-pillars">
        {spec.pillars.map((p) => (
          <div key={p.pillar} className={`dg-pillars__col dg-pillars__col--${p.pillar}`}>
            <PillarTag pillar={p.pillar} />
            <div className="dg-pillars__covers">
              <MonoLabel>Covers</MonoLabel>
              <p>{p.covers}</p>
            </div>
            <div className="dg-pillars__blind">
              <MonoLabel>Blind to</MonoLabel>
              <p>{p.blindSpot}</p>
            </div>
          </div>
        ))}
      </div>
    </DiagramFrame>
  )
}

/* ---------- Cycle: a closed loop ---------------------------------------- */

function Cycle({ spec }: { spec: Extract<DiagramSpec, { type: 'cycle' }> }) {
  return (
    <DiagramFrame alt={spec.alt} label="Cycle">
      <ol className="dg-cycle">
        {spec.steps.map((step, i) => (
          <li key={step} className="dg-cycle__step">
            <span className="dg-cycle__num" aria-hidden="true">
              {i + 1}
            </span>
            <span className="dg-cycle__label">{step}</span>
            <span className="dg-cycle__arrow" aria-hidden="true">
              {i === spec.steps.length - 1 ? '↺' : '→'}
            </span>
          </li>
        ))}
      </ol>
    </DiagramFrame>
  )
}

/* ---------- Ladder: an ordered descent or escalation --------------------- */

function Ladder({ spec }: { spec: Extract<DiagramSpec, { type: 'ladder' }> }) {
  return (
    <DiagramFrame alt={spec.alt} label="Ordered sequence">
      <ol className="dg-ladder">
        {spec.rungs.map((rung) => (
          <li
            key={rung.label}
            className="dg-ladder__rung"
            data-tone={rung.tone ?? 'observation'}
          >
            <div className="dg-ladder__marker" aria-hidden="true" />
            <div className="dg-ladder__content">
              <h4 className="dg-ladder__label">{rung.label}</h4>
              <p className="dg-ladder__note">{rung.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </DiagramFrame>
  )
}

/* ---------- Flow: a small node/edge graph -------------------------------- */

function Flow({ spec }: { spec: Extract<DiagramSpec, { type: 'flow' }> }) {
  return (
    <DiagramFrame alt={spec.alt} label="Relationships">
      <div className="dg-flow">
        {spec.nodes.map((node) => {
          const out = spec.edges.filter((e) => e.from === node.id)
          return (
            <div key={node.id} className="dg-flow__row">
              <div className="dg-flow__node" data-tone={node.tone ?? 'observation'}>
                <span className="dg-flow__label">{node.label}</span>
                {node.note && <span className="dg-flow__note">{node.note}</span>}
              </div>
              {out.length > 0 && (
                <ul className="dg-flow__edges">
                  {out.map((edge, i) => {
                    const target = spec.nodes.find((n) => n.id === edge.to)
                    return (
                      <li key={i}>
                        <span aria-hidden="true">→</span> {edge.label ? `${edge.label}: ` : ''}
                        {target?.label ?? edge.to}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </DiagramFrame>
  )
}

/* ---------- Dispatcher --------------------------------------------------- */

export function Diagram({ spec }: { spec: DiagramSpec }) {
  switch (spec.type) {
    case 'pipeline':
      return <Pipeline spec={spec} />
    case 'tiers':
      return <Tiers spec={spec} />
    case 'pillars':
      return <Pillars spec={spec} />
    case 'cycle':
      return <Cycle spec={spec} />
    case 'ladder':
      return <Ladder spec={spec} />
    case 'flow':
      return <Flow spec={spec} />
  }
}
