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
  // On the study page the hero above already carries the name and the lure,
  // so the title block reads as the opening line, not a second masthead.
  const slide = mode === 'slide'
  // One h1 per view: the study page's hero already owns it.
  const Heading = slide ? 'h1' : 'h2'
  return (
    <section className="block block--title pi-title" data-mode={mode}>
      <div className="pi-title__text">
        <Heading className="block--title__h pi-title__h">
          <span className="pi-title__num">{block.title}</span>
          {slide && session && <span className="pi-title__name">{session.title}</span>}
        </Heading>
        {block.lead && <p className="block--title__lead pi-title__lead">{block.lead}</p>}
        <p className="pi-title__plate">{block.overline}</p>
      </div>
      {slide && (
        <div className="pi-title__rig">
          <LureRig />
        </div>
      )}
    </section>
  )
}
