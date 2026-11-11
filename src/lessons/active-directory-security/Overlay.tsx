import { useEffect, useState, type CSSProperties } from 'react'
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
  const more = useStageOverflow(slideIndex)
  return (
    <>
    {more && (
      <div
        className="adw-match"
        style={
          {
            '--adw-top': `${more.top}px`,
            '--adw-cut': `${more.bottom}px`,
            '--adw-l': `${more.left}px`,
            '--adw-r': `${more.right}px`,
          } as CSSProperties
        }
      >
        <svg className="adw-match__line" viewBox="0 0 400 16" preserveAspectRatio="none" focusable="false">
          <path d="M0 8 H188 L193 2 L200 14 L207 2 L212 8 H400" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="adw-match__label">
          <svg viewBox="0 0 12 8" focusable="false">
            <path d="M1 1.5 L6 6.5 L11 1.5" />
          </svg>
          Match line · sheet continues below, scroll
        </span>
      </div>
    )}
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
    </>
  )
}

/* -------------------------------------------------------------------------
   Match line. When a sheet holds more than the projected stage can show,
   the player scrolls it; a drafting match line at the cut tells the room
   the sheet continues, and lifts away once the reader reaches its end.
   The layer stays decorative: it reads the stage, it never controls it.
   ------------------------------------------------------------------------- */

interface Cut {
  /** Where the visible sheet ends: under the last item that fits whole. */
  top: number
  bottom: number
  left: number
  right: number
}

/** Reading units the sheet may end on. */
const ITEMS = [
  'li',
  'tr',
  'p',
  'h2',
  'h3',
  'h4',
  'figure',
  '.lead',
  '.callout',
  '.redblue',
  '.synthetic-badge',
  '.evidence__line-wrap',
  '.evidence__head',
  '.adw-climb__rule',
  '.adw-reset__register > *',
  '.block__head',
].join(',')

function useStageOverflow(slideIndex: number): Cut | null {
  const [cut, setCut] = useState<Cut | null>(null)

  useEffect(() => {
    const stage = document.querySelector<HTMLElement>('.present__stage')
    const host = stage?.closest<HTMLElement>('.present')
    if (!stage || !host) return
    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const remaining = stage.scrollHeight - stage.scrollTop - stage.clientHeight
        if (remaining <= 6) {
          setCut(null)
          return
        }
        const s = stage.getBoundingClientRect()
        const h = host.getBoundingClientRect()
        const slide = stage.querySelector<HTMLElement>('.present__slide')
        const r = slide?.getBoundingClientRect() ?? s
        // End the sheet on a whole item: the match line sits under the last
        // reading unit that is fully in view, never through a line of text.
        const limit = s.bottom - 46
        let end = s.top
        slide?.querySelectorAll<HTMLElement>(ITEMS).forEach((el) => {
          const b = el.getBoundingClientRect()
          if (b.height > 0 && b.top >= s.top && b.bottom <= limit && b.bottom > end) end = b.bottom
        })
        setCut({
          top: Math.max(end + 12, s.top) - h.top,
          bottom: s.bottom - h.top,
          left: r.left - h.left,
          right: h.right - r.right,
        })
      })
    }
    measure()
    // Re-measure as the slide settles in (fonts, transitions, interactions).
    const t1 = window.setTimeout(measure, 120)
    const t2 = window.setTimeout(measure, 700)
    stage.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    const slide = stage.querySelector('.present__slide')
    if (slide) ro.observe(slide)
    const mo = new MutationObserver(measure)
    mo.observe(stage, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      stage.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      ro.disconnect()
      mo.disconnect()
    }
  }, [slideIndex])

  return cut
}
