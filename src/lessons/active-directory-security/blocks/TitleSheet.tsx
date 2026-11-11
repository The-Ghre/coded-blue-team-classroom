import type { TitleBlock } from '@/types/content'
import { getSession, getSlides } from '@/content'
import { SplitWords } from '@/motion'
import type { BlockOverrideProps } from '../../types'

/* =========================================================================
   TITLE SHEET — the cover of the drawing set
   =========================================================================
   The plan itself plots in behind (the backdrop is at full strength on this
   sheet). In front: the sheet title lettered large, the lead set as General
   Note 1, and a title block at the lower right that carries the overline's
   facts — track, session, extension — plus the set's real contents.
   ========================================================================= */

export function TitleSheet({ block, mode }: BlockOverrideProps<TitleBlock>) {
  const session = getSession('active-directory-security')
  const slides = session ? getSlides(session).length : undefined
  const parts = block.overline.split('·').map((s) => s.trim()).filter(Boolean)

  return (
    <section className={`block block--title adw-title adw-title--${mode}`}>
      <div className="adw-title__lettering">
        <h1 className="block--title__h adw-title__h">
          <SplitWords text={block.title} wordClassName="split-word adw-title__word" />
        </h1>
        {session && <p className="adw-title__drawing">{session.title}</p>}
      </div>

      {block.lead && (
        <div className="adw-title__note">
          <span className="adw-title__note-label">General note 1</span>
          <p className="block--title__lead">{block.lead}</p>
        </div>
      )}

      <dl className="adw-title__block">
        <div className="adw-title__block-set">
          <dt>Issued for</dt>
          <dd>
            {parts.map((p, i) => (
              <span key={i}>
                {p}
                {i < parts.length - 1 ? <span aria-hidden="true"> · </span> : null}
              </span>
            ))}
          </dd>
        </div>
        {session && (
          <>
            <div>
              <dt>Theory</dt>
              <dd>{session.theory.minutes} min</dd>
            </div>
            <div>
              <dt>Workshop</dt>
              <dd>{session.practical.minutes} min</dd>
            </div>
            <div>
              <dt>Sheets</dt>
              <dd>{slides}</dd>
            </div>
          </>
        )}
      </dl>
    </section>
  )
}
