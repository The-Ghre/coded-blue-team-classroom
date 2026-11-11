import { useId } from 'react'

/** Six observed relationships; arrows never imply host-to-host causation. */
export function AccessGraph({ reached = 6, compact = false }: { reached?: number; compact?: boolean }) {
  const arrow = useId().replace(/:/g, '')
  const nodes = [
    { x: 80, y: 170, name: 'svc_backup', kind: 'user', at: 0 },
    { x: 250, y: 290, name: 'FILESERVER-01', kind: 'computer', at: 1 },
    { x: 470, y: 290, name: 'FILESERVER-02', kind: 'computer', at: 2 },
    { x: 700, y: 290, name: 'DC-01', kind: 'computer', at: 3 },
    { x: 400, y: 160, name: 'krbtgt', kind: 'ticket', at: 4 },
    { x: 370, y: 45, name: 'Domain Admins', kind: 'group', at: 5 },
    { x: 700, y: 45, name: 'Domain root', kind: 'directory', at: 6 },
  ]
  const edges = [
    { d: 'M90 193 Q120 280 224 290', x: 150, y: 276, label: '4624 · NTLM' },
    { d: 'M100 182 Q260 250 440 282', x: 322, y: 253, label: '4624 · NTLM' },
    { d: 'M104 176 Q420 200 672 277', x: 592, y: 232, label: '4624 · NTLM' },
    { d: 'M108 164 L370 160', x: 246, y: 144, label: '4769 · RC4' },
    { d: 'M94 145 Q165 40 337 45', x: 204, y: 62, label: '4728 · MemberOf' },
    { d: 'M400 45 L665 45', x: 535, y: 25, label: '4662 · Replication' },
  ]
  return <div className="ad-graph-scroll" role="region" aria-label="Privilege relationship map; scroll horizontally to inspect all objects" tabIndex={0}><svg className={`ad-graph${compact ? ' ad-graph--compact' : ''}`} viewBox="0 0 800 350" fill="none" stroke="currentColor" role="img" aria-label="Synthetic event map: svc_backup authenticates to two file servers and DC-01 over NTLM, requests an RC4 ticket for krbtgt, joins Domain Admins, then invokes domain replication rights.">
    <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" /></marker></defs>
    {edges.map((e, i) => <g key={e.label + i} data-active={reached > i} className="ad-graph__edge"><path pathLength="1" d={e.d} markerEnd={`url(#${arrow})`}/><text x={e.x} y={e.y} textAnchor="middle" fill="currentColor" stroke="none">{e.label}</text></g>)}
    {nodes.map(n => <g key={n.name} transform={`translate(${n.x} ${n.y})`} className="ad-graph__node" data-active={reached >= n.at}>
      {n.kind === 'user' ? <><circle cy="-9" r="8"/><path d="M-17 18 V12 Q0 -5 17 12 V18 Z"/></> : n.kind === 'group' ? <><circle cx="-10" cy="-6" r="7"/><circle cx="10" cy="-6" r="7"/><path d="M-24 18 Q-23 1 -10 2 Q0 2 0 18 M0 18 Q0 2 10 2 Q23 1 24 18 Z"/></> : n.kind === 'directory' ? <><path d="M-22 -16 H-5 L0 -10 H24 V18 H-22 Z"/><path d="M-14 -1 H16 M-14 8 H10"/></> : n.kind === 'ticket' ? <><path d="M-22 -15 H22 V-5 Q12 0 22 5 V18 H-22 V5 Q-12 0 -22 -5 Z"/><path d="M-5 -8 V11 M4 -8 V11"/></> : <><rect x="-21" y="-17" width="42" height="29" rx="2"/><path d="M0 12 V21 M-12 21 H12"/></>}
      <text y="46" textAnchor="middle" fill="currentColor" stroke="none">{n.name}</text>
    </g>)}
  </svg></div>
}
