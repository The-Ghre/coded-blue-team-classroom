import { useLayoutEffect, useRef, useState } from 'react'
import type { ProjectionFrame } from '@/content/presentations'
import './presentation.css'

export function ProjectionSlide({ frame, build, number, total, sessionNumber }: {
  frame: ProjectionFrame; build: number; number: number; total: number; sessionNumber: number
}) {
  const holder = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useLayoutEffect(() => {
    const element = holder.current
    if (!element) return
    const resize = () => setScale(Math.min(element.clientWidth / 1920, element.clientHeight / 1080))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const visible = (i: number) => i <= build || ['agenda', 'section', 'recap', 'activity', 'question'].includes(frame.kind)
  return <main className="projector-stage" ref={holder} aria-label="Presentation slide">
    <div className="projector-fit" style={{ width: 1920 * scale, height: 1080 * scale }}>
      <article className={`projector-slide projector-slide--${frame.kind}`} key={frame.id}
        style={{ transform: `scale(${scale})` }} data-frame={frame.id}>
        <header className="projector-running"><span>CODED / Defensive security</span><span>{frame.chapter}</span></header>
        <div className="projector-content">
          <h1>{frame.title}</h1>
          {frame.kind === 'cover' && <div className="projector-cover-mark" aria-hidden="true"><span>Observe</span><i/><span>Reason</span><i/><span>Decide</span></div>}
          {frame.points && <ol className={`projector-points ${frame.kind === 'agenda' ? 'projector-route' : ''}`}>
            {frame.points.map((point, i) => <li key={i} data-revealed={visible(i)} aria-hidden={!visible(i)}><span className="projector-point-index" data-ordered={['agenda', 'section'].includes(frame.kind)} aria-hidden="true">{['agenda', 'section'].includes(frame.kind) ? String(i + 1).padStart(2, '0') : ''}</span><span>{point}</span></li>)}
          </ol>}
          {frame.steps && <ol className="projector-flow">{frame.steps.map((step, i) => <li key={i} data-revealed={visible(i)} aria-hidden={!visible(i)}><span className="projector-node">{i + 1}</span><h2>{step.label}</h2>{step.note && <p>{step.note}</p>}</li>)}</ol>}
          {frame.columns && <div className="projector-compare">{frame.columns.map((column, i) => <section key={i} data-revealed={visible(i)} aria-hidden={!visible(i)}><h2>{column.label}</h2><ul>{column.points.map((point, j) => <li key={j}>{point}</li>)}</ul></section>)}</div>}
          {frame.lines && <div className="projector-evidence"><span className="projector-evidence-label">Illustrative evidence excerpt</span>{frame.lines.map((line, i) => <div key={i} data-revealed={visible(i)} aria-hidden={!visible(i)}><code>{line.text}</code><span>{line.note}</span></div>)}</div>}
          {frame.takeaway && <p className="projector-takeaway">{frame.takeaway}</p>}
        </div>
        <footer className="projector-foot"><span>Session {String(sessionNumber).padStart(2, '0')} · {frame.half === 'theory' ? 'Understand' : 'Apply'}</span><span>{number} / {total}</span></footer>
      </article>
    </div>
  </main>
}
