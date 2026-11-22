import { useLayoutEffect, useRef, useState } from 'react'
import type { HeroProps } from '../types'
import type { EvidenceBlock } from '@/types/content'
import { SyntheticBadge } from '@/components/brand/Brand'

export default function Hero({ session, eyebrow, lead, actions }: HeroProps) {
  const [joined, setJoined] = useState(false)
  const recordsRef = useRef<HTMLDivElement>(null)
  const [link, setLink] = useState({ width: 500, height: 260, path: '' })
  useLayoutEffect(() => {
    const el = recordsRef.current
    if (!el) return
    const measure = () => {
      const marks = el.querySelectorAll('mark')
      if (marks.length < 2) return
      const box = el.getBoundingClientRect()
      const a = marks[0].getBoundingClientRect()
      const b = marks[1].getBoundingClientRect()
      const x = box.width - 12
      const y1 = a.top - box.top + a.height / 2
      const y2 = b.top - box.top + b.height / 2
      setLink({ width: box.width, height: box.height,
        path: `M${a.right - box.left + 3} ${y1}H${x}V${y2}H${b.right - box.left + 3}` })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    measure()
    return () => observer.disconnect()
  }, [session])
  const demo = session.theory.blocks.find((b): b is EvidenceBlock => b.kind === 'evidence')
  // Only the already published instructor demonstration; never workshop answers.
  const lines = demo?.lines.filter(l => l.text.includes('powershell.exe')).slice(0, 2) ?? []
  return <header className="fj-hero">
    <div className="fj-hero__intro">
      <h1>{session.title}</h1>
      <p className="fj-hero__context">{eyebrow}</p>
      {lead && <div className="fj-hero__lead">{lead}</div>}
      {actions && <div className="fj-hero__actions">{actions}</div>}
    </div>
    <div className="fj-join" data-joined={joined}>
      <div className="fj-join__bar"><SyntheticBadge /><span>Sysmon · FINANCE-PC-04</span></div>
      <div className="fj-join__records" ref={recordsRef}>
        {lines.map((line, i) => <div className="fj-record" key={line.text}>
          <span className="fj-record__number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <code>{line.text.split(/(powershell\.exe)/g).map((part, j) => part === 'powershell.exe'
            ? <mark key={j}>{part}</mark> : <span key={j}>{part}</span>)}</code>
        </div>)}
        <span hidden className="fj-join__decoration"><svg className="fj-join__link" viewBox={`0 0 ${link.width} ${link.height}`} aria-hidden="true"><path d={link.path} pathLength="1" /></svg></span>
      </div>
      <button hidden className="fj-join__control" type="button" aria-pressed={joined} onClick={() => setJoined(v => !v)}>
        <span>{joined ? 'Release' : 'Match'} process fields</span><code>powershell.exe</code>
      </button>
    </div>
  </header>
}
