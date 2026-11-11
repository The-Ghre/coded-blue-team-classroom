import type { CSSProperties } from 'react'
import type { ConceptBlock, ScenarioBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Decor, rng } from '../parts'

/* =========================================================================
   SCORES — the shared renderers, each with one written page beside it
   =========================================================================
   These blocks keep the shared renderer whole, so content edits flow
   through, and add one sheet of manuscript paper that states the block's
   argument as notation. Sheets are decoration: aria-hidden, absent on
   paper, and never the only place a fact lives — every word on them is
   already in the block's text.
   ========================================================================= */

/* ---------- Scenario: three staves, only one of them playing ------------ */

function ScenarioScore() {
  const notes = Array.from({ length: 48 }, (_, i) => i)
  return (
    <Decor className="nmf-print nmf-print--scenario">
      <div className="nmf-staves">
        <div className="nmf-staff" data-lane="network">
          <span className="nmf-staff__label">Network</span>
          <span className="nmf-staff__lines">
            {notes.map((i) => (
              <span key={i} className="nmf-staff__note" style={{ '--i': i } as CSSProperties} />
            ))}
          </span>
          <span className="nmf-staff__count">48</span>
        </div>
        <div className="nmf-staff" data-lane="user">
          <span className="nmf-staff__label">User</span>
          <span className="nmf-staff__lines" />
          <span className="nmf-staff__count">0</span>
        </div>
        <div className="nmf-staff" data-lane="disk">
          <span className="nmf-staff__label">Disk</span>
          <span className="nmf-staff__lines" />
          <span className="nmf-staff__count">0</span>
        </div>
        <div className="nmf-staff__axis">
          <span>00:00</span>
          <span>03:00</span>
        </div>
      </div>
    </Decor>
  )
}

export function Scenario({ block, mode, Default }: BlockOverrideProps<ScenarioBlock>) {
  return (
    <div className="nmf-with-print nmf-with-print--scenario" data-mode={mode}>
      <ScenarioScore />
      <Default block={block} mode={mode} />
    </div>
  )
}

/* ---------- PCAP triage: the order of play ------------------------------ */

const TRIAGE = [
  { n: 'I', step: 'Volume', where: 'Conversations, by bytes' },
  { n: 'II', step: 'Timing', where: 'IO Graph' },
  { n: 'III', step: 'Packets', where: 'Follow TCP Stream' },
]

function OrderOfPlay() {
  return (
    <Decor className="nmf-print nmf-print--order">
      <ol className="nmf-order">
        {TRIAGE.map((t, i) => (
          <li key={t.step} className="nmf-order__step" style={{ '--i': i } as CSSProperties}>
            <span className="nmf-order__n">{t.n}</span>
            <span className="nmf-order__step-name">{t.step}</span>
            <span className="nmf-order__where">{t.where}</span>
          </li>
        ))}
      </ol>
    </Decor>
  )
}

/* ---------- DNS: notes that never sound, and one that does --------------- */

function dgaNames(count: number) {
  const r = rng(7331)
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const tlds = ['.info', '.top', '.biz', '.xyz', '.net']
  return Array.from({ length: count }, () => {
    const len = 9 + Math.floor(r() * 7)
    let n = ''
    for (let i = 0; i < len; i++) n += abc[Math.floor(r() * abc.length)]
    return n + tlds[Math.floor(r() * tlds.length)]
  })
}

function DgaScore() {
  const names = dgaNames(14)
  const hit = 11
  return (
    <Decor className="nmf-print nmf-print--dga">
      <ol className="nmf-dga">
        {names.map((n, i) => (
          <li key={i} className="nmf-dga__q" data-hit={i === hit} style={{ '--i': i } as CSSProperties}>
            <span className="nmf-dga__name">{n}</span>
            <span className="nmf-dga__rc">{i === hit ? 'NOERROR · A' : 'NXDOMAIN'}</span>
          </li>
        ))}
      </ol>
      <p className="nmf-print__caption">Illustrative names, generated for this slide.</p>
    </Decor>
  )
}

/* ---------- Exfiltration: kilobytes, then gigabytes ---------------------- */

function VolumeScore() {
  const small = Array.from({ length: 34 }, (_, i) => 6 + ((i * 37) % 11))
  return (
    <Decor className="nmf-print nmf-print--volume">
      <div className="nmf-vol">
        <div className="nmf-vol__small">
          {small.map((h, i) => (
            <span key={i} className="nmf-vol__bar" style={{ '--h': h, '--i': i } as CSSProperties} />
          ))}
          <span className="nmf-vol__label">Normal uploads · kilobytes</span>
        </div>
        <div className="nmf-vol__big">
          <span className="nmf-vol__bar nmf-vol__bar--big" />
          <span className="nmf-vol__label">Exfiltration · gigabytes</span>
        </div>
      </div>
    </Decor>
  )
}

export function Concept({ block, mode, Default }: BlockOverrideProps<ConceptBlock>) {
  const print =
    block.id === 'pcap' ? <OrderOfPlay /> : block.id === 'dns' ? <DgaScore /> : block.id === 'exfil' ? <VolumeScore /> : null
  if (!print) return <Default block={block} mode={mode} />
  return (
    <div className={`nmf-with-print nmf-with-print--${block.id}`} data-mode={mode}>
      {print}
      <Default block={block} mode={mode} />
    </div>
  )
}
