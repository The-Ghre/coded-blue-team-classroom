import type { CSSProperties } from 'react'
import type { ConceptBlock, ScenarioBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Decor } from '../parts'

/* =========================================================================
   PRINTS — the shared renderers, each with one developed print beside it
   =========================================================================
   These blocks keep the shared renderer whole (so content edits flow
   through) and add one print that states the block's argument as an image.
   Prints are decoration: aria-hidden, absent on paper, and never the only
   place a fact lives — every word in them is already in the block's text.
   ========================================================================= */

/* ---------- Scenario: three lanes, one of them busy --------------------- */

function ScenarioPrint() {
  const ticks = Array.from({ length: 48 }, (_, i) => i)
  return (
    <Decor className="nmf-print nmf-print--scenario">
      <div className="nmf-lanes">
        <div className="nmf-lanes__row" data-lane="network">
          <span className="nmf-lanes__label">Network</span>
          <span className="nmf-lanes__track">
            {ticks.map((i) => (
              <span key={i} className="nmf-lanes__tick" style={{ '--i': i } as CSSProperties} />
            ))}
          </span>
          <span className="nmf-lanes__count">48</span>
        </div>
        <div className="nmf-lanes__row" data-lane="user">
          <span className="nmf-lanes__label">User</span>
          <span className="nmf-lanes__track" />
          <span className="nmf-lanes__count">0</span>
        </div>
        <div className="nmf-lanes__row" data-lane="disk">
          <span className="nmf-lanes__label">Disk</span>
          <span className="nmf-lanes__track" />
          <span className="nmf-lanes__count">0</span>
        </div>
        <div className="nmf-lanes__axis">
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
      <ScenarioPrint />
      <Default block={block} mode={mode} />
    </div>
  )
}

/* ---------- PCAP triage: a test strip, exposed in order ----------------- */

const TRIAGE = [
  { step: 'Volume', where: 'Conversations, by bytes' },
  { step: 'Timing', where: 'IO Graph' },
  { step: 'Packets', where: 'Follow TCP Stream' },
]

function TestStrip() {
  return (
    <Decor className="nmf-print nmf-print--test">
      <ol className="nmf-test">
        {TRIAGE.map((t, i) => (
          <li key={t.step} className="nmf-test__band" style={{ '--i': i } as CSSProperties}>
            <span className="nmf-test__n">{i + 1}</span>
            <span className="nmf-test__step">{t.step}</span>
            <span className="nmf-test__where">{t.where}</span>
          </li>
        ))}
      </ol>
    </Decor>
  )
}

/* ---------- DNS: queries that never resolve, and one that does ---------- */

function dgaNames(count: number) {
  let s = 7331
  const r = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const tlds = ['.info', '.top', '.biz', '.xyz', '.net']
  return Array.from({ length: count }, () => {
    const len = 9 + Math.floor(r() * 7)
    let n = ''
    for (let i = 0; i < len; i++) n += abc[Math.floor(r() * abc.length)]
    return n + tlds[Math.floor(r() * tlds.length)]
  })
}

function DgaPrint() {
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

/* ---------- Exfiltration: kilobytes, then gigabytes --------------------- */

function VolumePrint() {
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
    block.id === 'pcap' ? <TestStrip /> : block.id === 'dns' ? <DgaPrint /> : block.id === 'exfil' ? <VolumePrint /> : null
  if (!print) return <Default block={block} mode={mode} />
  return (
    <div className={`nmf-with-print nmf-with-print--${block.id}`} data-mode={mode}>
      {print}
      <Default block={block} mode={mode} />
    </div>
  )
}
