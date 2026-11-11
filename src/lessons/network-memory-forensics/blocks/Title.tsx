import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { getSession } from '@/content'
import { usePresentState } from '@/motion'
import { Cylinder, Decor, beaconPins, clock } from '../parts'

/* =========================================================================
   TITLE — the cylinder, unrolled
   =========================================================================
   The first thing the room sees is the cylinder laid flat. One tooth is
   pinned on a fixed beat: twelve pins, four minutes apart, the last twelve
   of the scenario's forty-eight connections ending at the 03:00 alert,
   which the blued index bracket marks. Around it, a person's pins fall
   wherever they fall. Empty positions are drawn too, so the beat is
   legible before anyone reads a number.
   ========================================================================= */

export function Title({ block, mode }: BlockOverrideProps<TitleBlock>) {
  const { presenting } = usePresentState()
  const session = getSession('network-memory-forensics')
  const rows = 7
  const cols = 48
  const beaconRow = 3
  const pins = beaconPins(rows, cols, beaconRow, 4, 7)
  const timeLabels = Array.from({ length: 12 }, (_, i) => ({ col: 3 + i * 4, label: clock(2 * 60 + 16 + i * 4) }))
  /* One h1 per view: on the study page the page header owns it. */
  const Heading = mode === 'study' ? 'h2' : 'h1'

  return (
    <section className="block block--title nmf-title" data-mode={mode}>
      <div className="nmf-title__plate">
        <p className="nmf-title__engraving">{block.overline}</p>
        <Decor className="nmf-title__band">
          <Cylinder
            rows={rows}
            cols={cols}
            pins={pins}
            timeLabels={timeLabels}
            bracket={{ row: beaconRow, col: 47 }}
            anchor="end"
            animate={presenting}
          />
        </Decor>
      </div>
      <div className="nmf-title__body">
        <Heading className="block--title__h nmf-title__h nmf-rise">{block.title}</Heading>
        {session && <p className="nmf-title__session">{session.title}</p>}
        {block.lead && <p className="block--title__lead nmf-title__lead">{block.lead}</p>}
      </div>
    </section>
  )
}
