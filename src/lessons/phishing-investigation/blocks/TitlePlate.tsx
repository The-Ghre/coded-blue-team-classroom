import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { getSession } from '@/content'
import { LureRig } from '../Lure'

/* =========================================================================
   THE TITLE — the lure, hung in front of the room
   =========================================================================
   The backdrop brings the water's surface down into the top fifth of the
   frame; this block hangs a lure through it on a single curved line,
   beside the session's name. Move the pointer near the lure and the paint
   dissolves under a lens, showing the wire and hooks the paint was there
   to hide. The block's own content — title, overline, lead — is set in
   full: the title and overline as the plate caption under the name.
   ========================================================================= */

export function TitlePlate({ block, mode }: BlockOverrideProps<TitleBlock>) {
  const session = getSession('phishing-investigation')
  // On the study page the hero above already carries the name and the lure,
  // so the title block reads as the opening line, not a second masthead.
  const slide = mode === 'slide'

  if (!slide) {
    return (
      <section className="block block--title pi-title" data-mode={mode}>
        <div className="pi-title__text">
          <h2 className="block--title__h pi-title__h pi-title__h--study">{block.title}</h2>
          {block.lead && <p className="block--title__lead pi-title__lead">{block.lead}</p>}
          <p className="pi-title__plate">
            <span>{block.overline}</span>
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="block block--title pi-title" data-mode={mode}>
      <div className="pi-title__text">
        <h1 className="block--title__h pi-title__h">
          <span className="pi-title__name">{session?.title ?? block.title}</span>
        </h1>
        {block.lead && <p className="block--title__lead pi-title__lead">{block.lead}</p>}
        <p className="pi-title__plate">
          <span>
            {session ? `${block.title} · ` : ''}
            {block.overline}
          </span>
        </p>
      </div>
      <div className="pi-title__rig">
        <LureRig curve />
      </div>
    </section>
  )
}
