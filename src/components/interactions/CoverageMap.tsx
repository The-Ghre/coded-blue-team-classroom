import { useState } from 'react'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'

/* =========================================================================
   COVERAGE MAP
   =========================================================================
   Signature interaction 6.

   Teaches: that a coverage map is a prioritisation tool rather than a
   scoreboard, and that the honest reading of it is never a percentage.
   Covered and uncovered are distinguished by fill pattern and glyph as
   well as colour, so the map survives a monochrome print and does not
   depend on colour perception.
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

export function CoverageMap({ data }: { data: unknown }) {
  const [selected, setSelected] = useState<Technique | null>(null)

  if (!isData(data)) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  const hunting = data.mode === 'hunting'

  return (
    <div className="ix ix--coverage">
      <div className="ix__bar">
        <div className="ix__bar-left">
          <MonoLabel>{hunting ? 'Hunting backlog' : 'ATT&CK coverage'}</MonoLabel>
        </div>
        <div className="ix__bar-right">
          <span className="cov__key">
            <span className="cov__key-item" data-covered="true">
              <span aria-hidden="true">✓</span> covered
            </span>
            <span className="cov__key-item" data-covered="false">
              <span aria-hidden="true">✕</span> no rule
            </span>
          </span>
        </div>
      </div>

      <div className="cov__grid">
        {data.tactics.map((tactic) => (
          <section key={tactic.name} className="cov__tactic">
            <h4 className="cov__tactic-name">{tactic.name}</h4>
            <ul className="cov__techniques">
              {tactic.techniques.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="cov__cell"
                    data-covered={t.covered}
                    aria-pressed={selected?.id === t.id}
                    onClick={() => setSelected(selected?.id === t.id ? null : t)}
                  >
                    <span className="cov__cell-mark" aria-hidden="true">
                      {t.covered ? '✓' : '✕'}
                    </span>
                    <span className="cov__cell-id">{t.id}</span>
                    <span className="cov__cell-name">{t.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {selected && (
        <div className="cov__detail" data-covered={selected.covered}>
          <div className="cov__detail-head">
            <EvidenceChip
              kind={selected.covered ? 'confirmed' : 'uncertain'}
              label={selected.covered ? 'Covered' : 'Gap'}
            />
            <span className="cov__detail-id">{selected.id}</span>
            <strong>{selected.name}</strong>
          </div>
          {selected.rule && (
            <div className="cov__detail-rule">
              <MonoLabel>Rule</MonoLabel>
              {selected.rule}
            </div>
          )}
          {selected.note && <p className="cov__detail-note">{selected.note}</p>}
        </div>
      )}

      <div className="cov__summary">
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
