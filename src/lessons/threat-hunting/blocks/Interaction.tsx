import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { BlockOverrideProps } from '../../types'
import type { InteractionBlock } from '@/types/content'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { Detail, Footer, Head } from '../parts'
import { Mark } from '../marks'

/* =========================================================================
   COVERAGE MAP, AS AN ALBUM PAGE
   =========================================================================
   The Session 4 coverage map, read for hunting. A printed album has a
   space for every stamp in the issue; the spaces you have not filled are
   your want list. Here every ATT&CK technique is a printed space: a rule
   mounts a stamp in it, a gap leaves it empty and hatched. Choosing a
   space opens its annotation. Same data, same teaching behaviour as the
   shared map — covered and gap carry glyph, word and fill pattern, never
   colour alone.
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
  return !!d && typeof d === 'object' && Array.isArray((d as Data).tactics) && !!(d as Data).summary
}

export function InteractionOverride({ block, mode, Default }: BlockOverrideProps<InteractionBlock>) {
  if (block.component !== 'coverage-map' || !isData(block.data)) return <Default block={block} mode={mode} />
  return (
    <section className={`block block--interaction th-album-block th-album-block--${mode}`}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="interaction__teaches">
        <MonoLabel>What this teaches</MonoLabel>
        <p>{block.teaches}</p>
      </div>
      <Album data={block.data} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function Album({ data }: { data: Data }) {
  const [selected, setSelected] = useState<Technique | null>(null)
  const slipRef = useRef<HTMLDivElement>(null)

  // On a projected slide the annotation must be on screen the moment a
  // space is chosen, so bring the slip into view within the stage.
  useEffect(() => {
    if (!selected || !slipRef.current?.closest('.present__slide')) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    slipRef.current.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [selected])
  const hunting = data.mode === 'hunting'
  let n = 0

  return (
    <div className="ix th-album">
      <div className="ix__bar th-album__bar">
        <MonoLabel>{hunting ? 'Hunting backlog' : 'ATT&CK coverage'}</MonoLabel>
        <span className="th-album__key">
          <span className="th-album__key-item" data-covered="true">
            <span className="th-album__key-swatch" aria-hidden="true" />
            <Mark kind="tick" /> covered
          </span>
          <span className="th-album__key-item" data-covered="false">
            <span className="th-album__key-swatch" aria-hidden="true" />
            <Mark kind="cross" /> no rule
          </span>
        </span>
      </div>

      <div className="cov__grid th-album__page">
        {data.tactics.map((tactic) => (
          <section key={tactic.name} className="th-album__row">
            <h4 className="th-album__tactic">{tactic.name}</h4>
            <ul className="th-album__spaces">
              {tactic.techniques.map((t) => {
                const k = n++
                const isSel = selected?.id === t.id
                return (
                  <li key={t.id} style={{ '--k': k } as CSSProperties}>
                    <button
                      type="button"
                      className="th-space"
                      data-covered={t.covered}
                      aria-pressed={isSel}
                      onClick={() => setSelected(isSel ? null : t)}
                    >
                      <span className="th-space__mark" aria-hidden="true">
                        <Mark kind={t.covered ? 'tick' : 'cross'} />
                      </span>
                      <span className="th-space__id">{t.id}</span>
                      <span className="th-space__name">{t.name}</span>
                      <span className="sr-only">{t.covered ? ', covered' : ', no rule'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="th-album__slip" aria-live="polite" ref={slipRef}>
        {selected ? (
          <div className="cov__detail th-slip" data-covered={selected.covered} key={selected.id}>
            <div className="cov__detail-head th-slip__head">
              <EvidenceChip
                kind={selected.covered ? 'confirmed' : 'uncertain'}
                label={selected.covered ? 'Covered' : 'Gap'}
              />
              <span className="th-slip__id">{selected.id}</span>
              <strong>{selected.name}</strong>
            </div>
            {selected.rule && (
              <p className="cov__detail-rule">
                <MonoLabel>Rule</MonoLabel>
                {selected.rule}
              </p>
            )}
            {selected.note && <p className="th-slip__note">{selected.note}</p>}
          </div>
        ) : (
          <p className="th-album__hint" data-th-deco="" hidden>Choose a space to read its annotation.</p>
        )}
      </div>

      <div className="cov__summary th-album__summary">
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
