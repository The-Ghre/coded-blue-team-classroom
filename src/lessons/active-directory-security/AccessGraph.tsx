import { useId } from 'react'

/** Six observed relationships; arrows never imply host-to-host causation. */
export function AccessGraph({ reached = 6, compact = false }: { reached?: number; compact?: boolean }) {
  const arrow = useId().replace(/:/g, '')
  const nodes = [
    { x: 100, y: 435, name: 'svc_backup', kind: 'user', at: 0 },
    { x: 300, y: 355, name: 'FILESERVER-01', kind: 'computer', at: 1 },
    { x: 500, y: 355, name: 'FILESERVER-02', kind: 'computer', at: 2 },
    { x: 500, y: 255, name: 'DC-01', kind: 'computer', at: 3 },
    { x: 300, y: 225, name: 'krbtgt', kind: 'ticket', at: 4 },
    { x: 100, y: 145, name: 'Domain Admins', kind: 'group', at: 5 },
    { x: 300, y: 45, name: 'Domain root', kind: 'directory', at: 6 },
  ]
  const edges = [
    { d: 'M123 427 Q200 430 275 364', x: 260, y: 435, label: '4624 · NTLM' },
    { d: 'M124 440 Q355 495 482 380', x: 455, y: 475, label: '4624 · NTLM' },
    { d: 'M124 419 Q380 375 482 277', x: 444, y: 320, label: '4624 · NTLM' },
    { d: 'M120 411 Q195 300 274 235', x: 300, y: 285, label: '4769 · RC4' },
    { d: 'M100 407 L100 177', x: 105, y: 200, label: '4728 · MemberOf' },
    { d: 'M122 130 Q190 45 271 45', x: 300, y: 115, label: '4662 · Replication' },
  ]
  return <div className="ad-graph-scroll" role="region" aria-label="Privilege climb: account access, group membership and replication rights; scroll horizontally to inspect all objects" tabIndex={0}><svg className={`ad-graph${compact ? ' ad-graph--compact' : ''}`} viewBox="0 0 620 505" fill="none" stroke="currentColor" role="img" aria-label="Synthetic event map: svc_backup authenticates to two file servers and DC-01 over NTLM, requests an RC4 ticket for krbtgt, joins Domain Admins, then invokes domain replication rights.">
    <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" /></marker></defs>
    {edges.map((e, i) => <g key={e.label + i} data-active={reached > i} className="ad-graph__edge"><path pathLength="1" d={e.d} markerEnd={`url(#${arrow})`}/><text x={e.x} y={e.y} textAnchor="middle" fill="currentColor" stroke="none">{e.label}</text></g>)}
    {nodes.map(n => <g key={n.name} transform={`translate(${n.x} ${n.y})`} className="ad-graph__node" data-active={reached >= n.at}>
      {n.kind === 'user' ? <><circle cy="-9" r="8"/><path d="M-17 18 V12 Q0 -5 17 12 V18 Z"/></> : n.kind === 'group' ? <><circle cx="-10" cy="-6" r="7"/><circle cx="10" cy="-6" r="7"/><path d="M-24 18 Q-23 1 -10 2 Q0 2 0 18 M0 18 Q0 2 10 2 Q23 1 24 18 Z"/></> : n.kind === 'directory' ? <><path d="M-22 -16 H-5 L0 -10 H24 V18 H-22 Z"/><path d="M-14 -1 H16 M-14 8 H10"/></> : n.kind === 'ticket' ? <><path d="M-22 -15 H22 V-5 Q12 0 22 5 V18 H-22 V5 Q-12 0 -22 -5 Z"/><path d="M-5 -8 V11 M4 -8 V11"/></> : <><rect x="-21" y="-17" width="42" height="29" rx="2"/><path d="M0 12 V21 M-12 21 H12"/></>}
      <text y="46" textAnchor="middle" fill="currentColor" stroke="none">{n.name}</text>
    </g>)}
  </svg></div>
}
