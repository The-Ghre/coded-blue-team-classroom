import { useId } from 'react'

/** A relationship map, not a network topology: edges are granted authority. */
export function AccessGraph({ reached = 6, compact = false }: { reached?: number; compact?: boolean }) {
  const arrow = useId().replace(/:/g, '')
  const nodes = [
    { x: 70, y: 275, name: 'svc_backup', kind: 'user' },
    { x: 230, y: 245, name: 'FILESERVER-01', kind: 'computer' },
    { x: 390, y: 190, name: 'DC-01', kind: 'computer' },
    { x: 540, y: 115, name: 'Domain Admins', kind: 'group' },
    { x: 710, y: 60, name: 'Domain root', kind: 'directory' },
  ]
  const edges = ['NTLM · 4624', 'NTLM · 4624', 'MemberOf · 4728', 'Replication · 4662']
  return <svg className={`ad-graph${compact ? ' ad-graph--compact' : ''}`} viewBox="0 0 800 350" role="img" aria-label="Synthetic relationship map: svc_backup authenticates to servers, joins Domain Admins and invokes domain replication rights.">
    <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" /></marker></defs>
    <g className="ad-graph__branches"><path d="M70 275 Q70 70 230 60 M230 245 Q300 310 410 310 M390 190 Q440 250 550 260 M540 115 Q620 180 720 210"/><circle cx="230" cy="60" r="14"/><rect x="400" y="300" width="24" height="20"/><circle cx="550" cy="260" r="14"/><rect x="708" y="200" width="24" height="20"/></g>
    {nodes.slice(0, -1).map((n, i) => { const next = nodes[i + 1]; return <g key={n.name} data-active={reached > i} className="ad-graph__edge"><path pathLength="1" d={`M${n.x + 25} ${n.y - 10} L${next.x - 28} ${next.y + 10}`} markerEnd={`url(#${arrow})`}/><text x={(n.x + next.x) / 2} y={(n.y + next.y) / 2 - 24} textAnchor="middle" transform={`rotate(-${i === 0 ? 10 : 23} ${(n.x + next.x) / 2} ${(n.y + next.y) / 2 - 24})`}>{edges[i]}</text></g> })}
    {nodes.map((n, i) => <g key={n.name} transform={`translate(${n.x} ${n.y})`} className="ad-graph__node" data-active={reached > i}>
      {n.kind === 'user' ? <><circle cy="-9" r="8"/><path d="M-17 18 V12 Q0 -5 17 12 V18 Z"/></> : n.kind === 'group' ? <><circle cx="-10" cy="-6" r="7"/><circle cx="10" cy="-6" r="7"/><path d="M-24 18 Q-23 1 -10 2 Q0 2 0 18 M0 18 Q0 2 10 2 Q23 1 24 18 Z"/></> : n.kind === 'directory' ? <><path d="M-22 -16 H-5 L0 -10 H24 V18 H-22 Z"/><path d="M-14 -1 H16 M-14 8 H10"/></> : <><rect x="-21" y="-17" width="42" height="29" rx="2"/><path d="M0 12 V21 M-12 21 H12"/></>}
      <text y="46" textAnchor="middle">{n.name}</text>
    </g>)}
  </svg>
}
