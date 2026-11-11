import type { TitleBlock as TitleBlockType } from '@/types/content'
import type { BlockOverrideProps } from '../types'
import { useLesson } from '../LessonContext'
import { getSession } from '@/content'
import { RouteStrips, Stamp } from './parts'

/* =========================================================================
   TITLE — the first tag of the night
   =========================================================================
   The overline is printed into the tag's ruled fields rather than floated
   above the heading; the session number is time-stamped in violet ink; the
   three routing strips stand intact along the edge, because nothing has
   been decided yet.
   ========================================================================= */

export function TitleBlock({ block, mode }: BlockOverrideProps<TitleBlockType>) {
  const { slug } = useLesson()
  const session = slug ? getSession(slug) : undefined
  const num = session ? String(session.number).padStart(2, '0') : ''
  const fields = block.overline.split('·').map((s) => s.trim()).filter(Boolean)
  const Heading = mode === 'slide' ? 'h1' : 'h2'

  return (
    <section className="block block--title soc-title" data-mode={mode}>
      <dl className="soc-fields soc-title__fields">
        {fields.map((f, i) => (
          <div key={i} className="soc-field">
            <dt>{i === 0 ? 'Filed under' : 'Tag'}</dt>
            <dd>{f}</dd>
          </div>
        ))}
      </dl>
      <Heading className="block--title__h soc-title__h">{block.title}</Heading>
      {block.lead && <p className="block--title__lead soc-title__lead">{block.lead}</p>}
      {num && <Stamp className="soc-title__stamp">S·{num}</Stamp>}
      <RouteStrips className="soc-title__strips" />
    </section>
  )
}
