import { useState } from 'react'
import type { HeroProps } from '../types'
import type { EvidenceBlock } from '@/types/content'
import { SyntheticBadge } from '@/components/brand/Brand'

export default function Hero({ session, eyebrow, lead, actions }: HeroProps) {
  const [joined, setJoined] = useState(false)
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
      <div className="fj-join__records">
        {lines.map((line, i) => <div className="fj-record" key={line.text}>
          <span className="fj-record__number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <code>{line.text.split(/(powershell\.exe)/g).map((part, j) => part === 'powershell.exe'
            ? <mark key={j}>{part}</mark> : <span key={j}>{part}</span>)}</code>
        </div>)}
        <svg className="fj-join__link" viewBox="0 0 500 30" preserveAspectRatio="none" aria-hidden="true"><path d="M30 2V15H470V28" pathLength="1" /><circle cx="30" cy="2" r="2"/><circle cx="470" cy="28" r="2"/></svg>
      </div>
      <button className="fj-join__control" type="button" aria-pressed={joined} onClick={() => setJoined(v => !v)}>
        <span>{joined ? 'Release' : 'Match'} process fields</span><code>powershell.exe</code>
      </button>
    </div>
  </header>
}
