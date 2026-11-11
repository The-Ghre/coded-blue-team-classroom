import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { getSession } from '@/content'
import { LureRig } from '../Lure'

/* =========================================================================
   THE TITLE — the lure, hung in front of the room
   =========================================================================
   The backdrop brings the water's surface down into the top fifth of the
   frame; this block hangs a lure through it on a single line, beside the
   session's name. Move the pointer near the lure and the paint dissolves
   under a lens, showing the wire and hooks the paint was there to hide.
   The block's own content — overline, title, lead — is set in full.
   ========================================================================= */

export function TitlePlate({ block, mode }: BlockOverrideProps<TitleBlock>) {
  const session = getSession('phishing-investigation')
  return (
    <section className="block block--title pi-title" data-mode={mode}>
      <div className="pi-title__text">
        <h1 className="block--title__h pi-title__h">
          <span className="pi-title__num">{block.title}</span>
          {session && <span className="pi-title__name">{session.title}</span>}
        </h1>
        {block.lead && <p className="block--title__lead pi-title__lead">{block.lead}</p>}
        <p className="pi-title__plate">{block.overline}</p>
      </div>
      <div className="pi-title__rig">
        <LureRig />
      </div>
    </section>
  )
}
