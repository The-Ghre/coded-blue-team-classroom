import { useId, useState } from 'react'

/** A schematic of the public opening scenario, never workshop solutions. */
export function Trace({ compact = false }: { compact?: boolean }) {
  const [region, setRegion] = useState(10)
  const id = useId()
  const injected = region === 10
  return <figure className={`lesson-layer nm-trace ${compact ? 'nm-trace--compact' : ''}`}>
    <figcaption>Network timing / memory pages <span>Synthetic schematic</span></figcaption>
    <svg viewBox="0 0 600 282" role="img" aria-label="Evenly spaced connections above a process memory map. A plum page contains an MZ header. The matching disk row is empty.">
      <text x="18" y="29">PCAP · one destination</text>
      <text x="580" y="29" textAnchor="end">Δt 240 s</text>
      <path className="nm-trace__axis" d="M18 91H582" />
      {Array.from({ length: 12 }, (_, i) => <g key={i} className="nm-trace__packet" style={{ animationDelay: `${i * 110}ms` }}>
        <path d={`M${32 + i * 48} 91v-30h10v30`} />
        <circle cx={37 + i * 48} cy="61" r="3" />
      </g>)}
      <path className="nm-trace__link" d="M517 94v26H391v34" />
      <text x="18" y="141">RAM · explorer.exe</text>
      <text x="580" y="141" textAnchor="end">PID 2344</text>
      {Array.from({ length: 16 }, (_, i) => <g key={i}>
        <rect className={i === 10 ? 'nm-trace__injected' : 'nm-trace__page'} x={18 + i * 35.3} y="160" width="30" height="49" />
        {i === region && <rect className="nm-trace__selection" x={15 + i * 35.3} y="156" width="36" height="57" />}
        {i === 10 && <text className="nm-trace__mz" x={33 + i * 35.3} y="190" textAnchor="middle">MZ</text>}
        <rect className="nm-trace__disk" x={18 + i * 35.3} y="248" width="30" height="10" />
      </g>)}
      <text x="18" y="238">Disk · no corresponding file</text>
    </svg>
    {!compact && <div className="nm-trace__inspect">
      <label htmlFor={id}>Inspect memory page <output>{region.toString(16).toUpperCase().padStart(2, '0')}</output></label>
      <input id={id} type="range" min="0" max="15" value={region} aria-valuetext={`Page ${region.toString(16).toUpperCase().padStart(2, '0')}${injected ? ': MZ header, executable and writable' : ': mapped process memory'}`} onChange={e => setRegion(Number(e.target.value))} />
      <p aria-live="polite">{injected ? '4d 5a · MZ · executable + writable' : 'Mapped process memory · inspect the plum page for the MZ header.'}</p>
    </div>}
  </figure>
}
