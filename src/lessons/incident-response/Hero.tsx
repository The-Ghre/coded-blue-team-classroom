import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { HeroProps } from '../types'
import { useProgress } from '@/lib/progress'
import { MarkerRing } from './parts'

/* =========================================================================
   THE CONTACT SHEET
   =========================================================================
   Study, workshop and overview open on a fixed print: every section of the
   session as a frame on a contact sheet, in order. Sections marked complete
   are developed to full density; the one the reader last stopped on is
   ringed in china marker; the rest are still latent. Each frame is a real
   link to its section. The page title is printed on the sheet's margin.
   ========================================================================= */

export default function Hero({ session, surface, half, eyebrow, lead, actions }: HeroProps) {
  const { forSession } = useProgress()
  const progress = forSession(session.slug)

  const strips =
    surface === 'overview'
      ? [
          { key: 'theory', label: 'Theory', route: 'study', blocks: session.theory.blocks, offset: 0 },
          {
            key: 'practical',
            label: 'Workshop',
            route: 'practical',
            blocks: session.practical.blocks,
            offset: session.theory.blocks.length,
          },
        ]
      : half === 'theory'
        ? [{ key: 'theory', label: 'Theory', route: 'study', blocks: session.theory.blocks, offset: 0 }]
        : [
            {
              key: 'practical',
              label: 'Workshop',
              route: 'practical',
              blocks: session.practical.blocks,
              offset: session.theory.blocks.length,
            },
          ]

  const total = session.theory.blocks.length + session.practical.blocks.length
  const fixed = strips.reduce(
    (n, s) => n + s.blocks.filter((b) => progress.completed.includes(b.id)).length,
    0,
  )
  const shown = strips.reduce((n, s) => n + s.blocks.length, 0)

  return (
    <header className={`ir-hero ir-hero--${surface} ${surface === 'overview' ? 'overview__head' : 'study__header'}`}>
      <div className="ir-hero__sheet">
        <div className="ir-hero__caption">
          <h1>{session.title}</h1>
          <p className="ir-hero__edge">
            <span>{eyebrow}</span>
            <span className="ir-hero__sep"> · </span>
            <span>
              {fixed} of {shown} sections complete
            </span>
          </p>
          {lead ? <div className="lead ir-hero__lead">{lead}</div> : null}
          {actions ? <div className="ir-hero__actions">{actions}</div> : null}
        </div>

        <nav className="ir-hero__strips study__section-tools" aria-label="Sections on this contact sheet">
          {strips.map((strip) => (
            <div key={strip.key} className="ir-hero__strip" data-half={strip.key}>
              <span className="ir-hero__strip-label" aria-hidden="true">
                {strip.label}
              </span>
              <ol className="ir-hero__frames">
                {strip.blocks.map((b, i) => {
                  const n = strip.offset + i + 1
                  const complete = progress.completed.includes(b.id)
                  const resume = progress.lastBlockId === b.id
                  return (
                    <li
                      key={b.id}
                      className="ir-hero__frame"
                      data-state={complete ? 'fixed' : 'latent'}
                      style={{ '--f': i } as CSSProperties}
                    >
                      <Link
                        to={`/session/${session.slug}/${strip.route}#${b.id}`}
                        aria-label={`Frame ${n} of ${total}: ${b.title}${complete ? ', marked complete' : ''}${resume ? ', where you stopped' : ''}`}
                      >
                        <span className="ir-hero__exposure" aria-hidden="true">
                          <span className="ir-hero__frame-num">{n}</span>
                          {b.minutes ? <span className="ir-hero__frame-min">{b.minutes}′</span> : null}
                          {resume && <MarkerRing className="ir-hero__resume" />}
                        </span>
                        <span className="ir-hero__frame-title" aria-hidden="true">
                          {b.title}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}
