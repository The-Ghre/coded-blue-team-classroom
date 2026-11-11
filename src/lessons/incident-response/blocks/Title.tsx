import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { MarkerRing, useKitSession } from '../parts'

/* =========================================================================
   TITLE — a print rising in the developer tray
   =========================================================================
   The session number develops out of the dark: shadows first, then the
   mid-tones, then full density, readable within the first half-second and
   still gaining density after. A tray-liquid displacement settles out as
   it develops. The number is ringed in china marker — the frame that
   matters.
   ========================================================================= */

export default function Title({ block, mode }: BlockOverrideProps<TitleBlock>) {
  const session = useKitSession()
  const match = /^(.*?)(\d+)\s*$/.exec(block.title)
  const word = match ? match[1].trim() : block.title
  const num = match ? match[2] : null

  return (
    <section className="block block--title ir-title" data-mode={mode}>
      <svg className="ir-title__defs" aria-hidden="true" focusable="false">
        <filter id="ir-tray" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="5" result="n">
            <animate attributeName="baseFrequency" dur="2.4s" values="0.012 0.04;0.016 0.05" fill="freeze" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0">
            <animate attributeName="scale" dur="1.6s" values="22;6;0" keyTimes="0;0.4;1" fill="freeze" />
          </feDisplacementMap>
        </filter>
      </svg>

      <div className="ir-title__print">
        <span className="ir-title__sheen" aria-hidden="true" />
        <div className="ir-title__ink">
        <h1 className="block--title__h ir-title__h" aria-label={block.title}>
          <span className="ir-title__word" aria-hidden="true">
            {word}
          </span>
          {num && (
            <span className="ir-title__num" aria-hidden="true">
              {num}
              <MarkerRing className="ir-title__ring" />
            </span>
          )}
        </h1>
        {session && <p className="ir-title__session">{session.title}</p>}
        {block.lead && <p className="block--title__lead ir-title__lead">{block.lead}</p>}
        <p className="ir-title__overline">{block.overline}</p>
        </div>
      </div>
    </section>
  )
}
