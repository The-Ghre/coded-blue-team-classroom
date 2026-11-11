import type { StageProps } from '../types'

/* =========================================================================
   OVERLAY — the sheet border and its title strip
   =========================================================================
   Every projected slide sits inside a drawing sheet: a ruled border and a
   vertical title strip at the right edge naming the project and the sheet
   number, the way a set of construction drawings is bound and read. Grid
   references belong to the plan alone, so the frame carries none of its
   own. It brightens a little when the chrome fades and the room is reading
   the sheet alone.
   ========================================================================= */

export default function Overlay({ slideIndex, slideCount, half, focusMode, session }: StageProps) {
  const n = String(slideIndex + 1).padStart(2, '0')
  const of = String(slideCount).padStart(2, '0')
  return (
    <div className="adw-sheet" data-focus={focusMode} data-half={half}>
      <div className="adw-sheet__border" />
      <div className="adw-sheet__strip">
        <span className="adw-sheet__project">S-{session.number} · Active Directory</span>
        <span className="adw-sheet__half">{half === 'practical' ? 'Workshop' : 'Theory'}</span>
        <span className="adw-sheet__no">
          <b>{n}</b>
          <i>/{of}</i>
        </span>
      </div>
    </div>
  )
}
