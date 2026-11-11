import type { StageProps } from '../types'

/* =========================================================================
   OVERLAY — the sheet border and its title strip
   =========================================================================
   Every projected slide sits inside a drawing sheet: a ruled border with
   grid references along the top and left, and a vertical title strip at the
   right edge naming the project and the sheet number, the way a set of
   construction drawings is bound and read. It brightens a little when the
   chrome fades and the room is reading the sheet alone.
   ========================================================================= */

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = ['1', '2', '3', '4', '5']

export default function Overlay({ slideIndex, slideCount, half, focusMode, session }: StageProps) {
  const n = String(slideIndex + 1).padStart(2, '0')
  const of = String(slideCount).padStart(2, '0')
  return (
    <div className="adw-sheet" data-focus={focusMode} data-half={half}>
      <div className="adw-sheet__border" />
      <ol className="adw-sheet__cols">
        {COLS.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ol>
      <ol className="adw-sheet__rows">
        {ROWS.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
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
