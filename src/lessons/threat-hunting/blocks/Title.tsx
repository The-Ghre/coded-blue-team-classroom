import type { BlockOverrideProps } from '../../types'
import type { TitleBlock } from '@/types/content'
import { getSession } from '@/content'
import { useLesson } from '../../LessonContext'
import { Pane } from '../Pane'

/* Title: the issue itself. On a slide, a pane of the session's stamp beside
   the title; in study mode the page hero already shows the pane, so the
   section keeps only the overline, title and lead. */
export function TitleOverride({ block, mode }: BlockOverrideProps<TitleBlock>) {
  const { slug } = useLesson()
  const session = slug ? getSession(slug) : undefined
  const slides = session ? [...session.theory.blocks, ...session.practical.blocks] : []
  const v = slides.findIndex((b) => b.id === 'baseline')

  return (
    <section className={`block block--title th-title th-title--${mode}`}>
      {mode === 'slide' && (
        <div className="th-title__sheet">
          <Pane
            variety={v >= 0 && v < 20 ? v : 6}
            label={(session?.title ?? 'Threat Hunting').toUpperCase()}
            className="th-title__pane"
          />
        </div>
      )}
      <div className="th-title__text">
        <h1 className="block--title__h th-title__h">{block.title}</h1>
        {block.lead && <p className="block--title__lead th-title__lead">{block.lead}</p>}
        <p className="th-title__overline">{block.overline}</p>
      </div>
    </section>
  )
}
