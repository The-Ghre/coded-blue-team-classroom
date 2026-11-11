import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { getSession } from '@/content'
import { usePresentState } from '@/motion'
import { Decor, FilmStrip, beaconFrames } from '../parts'

/* =========================================================================
   TITLE — the contact sheet
   =========================================================================
   The first thing the room sees is a timer's roll: eight frames, four
   minutes apart, each exposing the same 180-byte payload in the same place.
   The last twelve of the scenario's forty-eight connections, ending at the
   03:00 alert. A china marker circles the one the alert fired on.
   ========================================================================= */

export function Title({ block, mode }: BlockOverrideProps<TitleBlock>) {
  const { presenting } = usePresentState()
  const session = getSession('network-memory-forensics')
  const frames = beaconFrames(8, 2 * 60 + 32)
  const Heading = mode === 'study' ? 'h2' : 'h1'

  return (
    <section className="block block--title nmf-title" data-mode={mode}>
      <div className="nmf-title__sheet">
        <p className="nmf-title__edge">{block.overline}</p>
        <Decor className="nmf-title__strip">
          <FilmStrip
            frames={frames}
            topEdge="SAFETY FILM · WORKSTATION-07 → 91.92.251.103"
            startNumber={41}
            ring={7}
            animateRing={presenting}
            anchor="end"
          />
        </Decor>
      </div>
      <div className="nmf-title__body">
        {/* One h1 per view: on the study page the page header owns it. */}
        <Heading className="block--title__h nmf-title__h nmf-develop">{block.title}</Heading>
        {session && <p className="nmf-title__session">{session.title}</p>}
        {block.lead && <p className="block--title__lead nmf-title__lead">{block.lead}</p>}
      </div>
    </section>
  )
}
