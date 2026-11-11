import { Link } from 'react-router-dom'
import type { HeroProps } from '../types'
import { useProgress } from '@/lib/progress'
import { Acquisition } from './parts'

export default function Hero({ session, surface, half, eyebrow, lead, actions }: HeroProps) {
  const progress = useProgress().forSession(session.slug)
  const groups = surface === 'overview'
    ? [{label: 'Theory', route: 'study', blocks: session.theory.blocks}, {label: 'Workshop', route: 'practical', blocks: session.practical.blocks}]
    : [{label: half === 'theory' ? 'Theory' : 'Workshop', route: half === 'theory' ? 'study' : 'practical', blocks: session[half].blocks}]
  return <header className={`ir-hero ${surface === 'overview' ? 'overview__head' : 'study__header'}`}>
    <div className="ir-hero__intro">
      <div><h1>{session.title}</h1><p className="ir-context">{eyebrow}</p>{lead && <div className="lead">{lead}</div>}{actions && <div className="ir-actions">{actions}</div>}</div>
      <Acquisition />
    </div>
    <nav className="ir-register study__section-tools" aria-label="Session sections">
      {groups.map(group => <div key={group.route}><h2>{group.label}</h2><ol>{group.blocks.map((block, i) => <li key={block.id}>
        <Link to={`/session/${session.slug}/${group.route}#${block.id}`} aria-current={progress.lastBlockId === block.id ? 'location' : undefined}>
          <span className="ir-register__number">{String(i + 1).padStart(2, '0')}</span><span>{block.title}</span><span className="ir-register__state">{progress.completed.includes(block.id) ? 'Complete' : block.minutes ? `${block.minutes} min` : 'Read'}</span>
        </Link></li>)}</ol></div>)}
    </nav>
  </header>
}
