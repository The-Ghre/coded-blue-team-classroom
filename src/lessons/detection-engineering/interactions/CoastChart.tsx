import { useId, useState, type CSSProperties } from 'react'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { LitGlyph, UnlitGlyph } from '../glyphs'

/* =========================================================================
   COAST CHART — the coverage map as a passage
   =========================================================================
   Same data, same selection behaviour and the same summary as the shared
   Coverage Map (src/components/interactions/CoverageMap.tsx).

   The tactics are reaches of one coast, in the order an intrusion sails
   them. Every technique is a light standing on its reach: lit when a rule
   covers it, an unlit beacon when none does. The adversary's track runs
   the whole passage, so a reach with no lights — Lateral Movement in this
   lesson — reads as what it is: a stretch of water nobody watches.
   Lit and unlit differ by symbol and by word, never by colour alone.
   ========================================================================= */

interface Technique {
  id: string
  name: string
  covered: boolean
  rule?: string
  note?: string
}

interface Tactic {
  name: string
  techniques: Technique[]
}

interface Data {
  mode?: 'detection' | 'hunting'
  tactics: Tactic[]
  summary: { total: number; covered: number; prompt: string }
}

function isData(d: unknown): d is Data {
  return !!d && typeof d === 'object' && Array.isArray((d as Data).tactics)
}

/**
 * One reach of the coast with a light per technique. The coastline is a
 * function of the passage position, not of the reach, so neighbouring
 * reaches join into one continuous shore and the adversary's track runs
 * unbroken through them. Lit lights show their sector (dashed limits, a
 * starboard-green arc) and a magenta flare; unlit beacons are bare towers.
 * Decorative: the Light List below each reach carries the meaning in words.
 */
function Reach({ tactic, focusId, index }: { tactic: Tactic; focusId: string | null; index: number }) {
  const n = tactic.techniques.length
  const lit = tactic.techniques.filter((t) => t.covered).length
  const H = 96
  const y = (x: number) => {
    const g = index * 200 + x
    return 72 + Math.sin(g / 41) * 5 + Math.sin(g / 13 + 1.3) * 1.6
  }
  const pts = Array.from({ length: 21 }, (_, i) => `${i * 10},${y(i * 10).toFixed(1)}`).join(' ')
  const rad = (d: number) => (d * Math.PI) / 180
  return (
    <svg className="de-reach" viewBox={`0 0 200 ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false" data-unlit={lit === 0}>
      <polygon className="de-reach__land" points={`0,${H} ${pts} 200,${H}`} />
      <polyline className="de-reach__coast" points={pts} />
      <line className="de-reach__track" x1="0" y1="16" x2="200" y2="16" />
      {tactic.techniques.map((t, i) => {
        const x = ((i + 0.5) / n) * 200
        const by = y(x) - 1
        const focused = focusId === t.id
        const r = 30
        const a0 = rad(-118)
        const a1 = rad(-62)
        return (
          <g key={t.id} className="de-reach__light" data-covered={t.covered} data-focus={focused || undefined}>
            {t.covered ? (
              <>
                <path
                  className="de-reach__limit"
                  d={`M ${x} ${by} L ${x + Math.cos(a0) * (r + 6)} ${by + Math.sin(a0) * (r + 6)} M ${x} ${by} L ${x + Math.cos(a1) * (r + 6)} ${by + Math.sin(a1) * (r + 6)}`}
                />
                <path
                  className="de-reach__arc"
                  d={`M ${x + Math.cos(a0) * r} ${by + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${x + Math.cos(a1) * r} ${by + Math.sin(a1) * r}`}
                />
                <path
                  className="de-reach__flare"
                  d={`M ${x + 2} ${by - 1} C ${x + 7} ${by - 4}, ${x + 12} ${by - 7}, ${x + 19} ${by - 11} C ${x + 13} ${by - 5}, ${x + 8} ${by - 2}, ${x + 3} ${by + 1} Z`}
                />
                <circle className="de-reach__star" cx={x} cy={by} r="2.8" />
              </>
            ) : (
              <path className="de-reach__beacon" d={`M ${x - 4} ${by} L ${x - 1.2} ${by - 16} L ${x + 1.2} ${by - 16} L ${x + 4} ${by} Z`} />
            )}
            {focused && <circle className="de-reach__ring" cx={x} cy={by - 6} r="13" />}
          </g>
        )
      })}
    </svg>
  )
}

export function CoastChart({ data }: { data: unknown }) {
  const [selected, setSelected] = useState<Technique | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const detailId = useId()

  if (!isData(data)) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  const hunting = data.mode === 'hunting'
  const focusId = hover ?? selected?.id ?? null

  return (
    <div className="ix ix--coverage de-coast">
      <div className="ix__bar">
        <div className="ix__bar-left">
          <MonoLabel>{hunting ? 'Hunting backlog' : 'ATT&CK coverage'}</MonoLabel>
        </div>
        <div className="ix__bar-right">
          <span className="cov__key de-coast__key">
            <span className="cov__key-item" data-covered="true">
              <LitGlyph size={18} /> covered — a lit light
            </span>
            <span className="cov__key-item" data-covered="false">
              <UnlitGlyph size={18} /> no rule — an unlit beacon
            </span>
          </span>
        </div>
      </div>

      <div className="cov__grid de-coast__passage">
        {data.tactics.map((tactic, ti) => {
          const lit = tactic.techniques.filter((t) => t.covered).length
          return (
            <section
              key={tactic.name}
              className="cov__tactic de-coast__reach"
              data-unlit={lit === 0}
              style={{ '--i': ti } as CSSProperties}
            >
              <Reach tactic={tactic} focusId={focusId} index={ti} />
              <h4 className="cov__tactic-name de-coast__name">{tactic.name}</h4>
              <p className="de-coast__tally">
                {lit === 0 ? 'Unlit reach' : `${lit} of ${tactic.techniques.length} lit`}
              </p>
              <ul className="cov__techniques de-coast__lights">
                {tactic.techniques.map((t) => {
                  const on = selected?.id === t.id
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className="de-tech"
                        data-covered={t.covered}
                        aria-pressed={on}
                        aria-controls={on ? detailId : undefined}
                        onClick={() => setSelected(on ? null : t)}
                        onPointerEnter={() => setHover(t.id)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover(t.id)}
                        onBlur={() => setHover(null)}
                      >
                        <span className="de-tech__mark" aria-hidden="true">
                          {t.covered ? <LitGlyph size={20} /> : <UnlitGlyph size={20} />}
                        </span>
                        <span className="de-tech__id">{t.id}</span>
                        <span className="de-tech__name">{t.name}</span>
                        <span className="sr-only">{t.covered ? ', covered' : ', no rule'}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      {selected && (
        <div className="cov__detail de-entry" id={detailId} data-covered={selected.covered} aria-live="polite">
          <div className="cov__detail-head de-entry__head">
            <EvidenceChip kind={selected.covered ? 'confirmed' : 'uncertain'} label={selected.covered ? 'Covered' : 'Gap'} />
            <span className="cov__detail-id de-entry__id">{selected.id}</span>
            <strong className="de-entry__name">{selected.name}</strong>
          </div>
          {selected.rule && (
            <div className="cov__detail-rule de-entry__rule">
              <MonoLabel>Rule</MonoLabel>
              <p>{selected.rule}</p>
            </div>
          )}
          {selected.note && <p className="cov__detail-note de-entry__note">{selected.note}</p>}
        </div>
      )}

      <div className="cov__summary de-coast__summary">
        <div className="cov__summary-counts">
          <span>
            <strong>{data.summary.covered}</strong> covered
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong>{data.summary.total - data.summary.covered}</strong> uncovered
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong>{data.summary.total}</strong> techniques mapped
          </span>
        </div>
        <p className="cov__summary-prompt">{data.summary.prompt}</p>
      </div>
    </div>
  )
}
