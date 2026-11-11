import { useRef, useState } from 'react'
import { useIsVisible } from '@/motion'

/** Schematic only: no host addresses, timestamps or investigation answers. */
export function TraceMap() {
  const [deleted, setDeleted] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const visible = useIsVisible(ref)
  return (
    <div ref={ref} className="hf-map" data-deleted={deleted} data-running={visible}>
      <div className="hf-map__controls">
        <span>Execution evidence · schematic</span>
        <button type="button" className="btn btn--sm" aria-pressed={deleted} onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Restore executable in schematic' : 'Delete executable in schematic'}
        </button>
      </div>
      <div className="hf-map__trees">
        {['Windows', 'Linux'].map((host, i) => {
          return <svg key={host} viewBox="0 0 490 286" width="490" height="286" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label={`${host}: executable ${deleted ? 'deleted' : 'present'}; independent execution records remain.`} className={`hf-map__host hf-map__host--${i}`}>
            <text fill="currentColor" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="18" x="14" y="35" className="hf-map__platform">{host}</text>
            <path d="M15 62H472M36 83V248M36 104H79M36 172H79M36 240H79" className="hf-map__tree" />
            <g className="hf-map__object">
              <path d="M80 84h18l9 9v25H80zM98 84v9h9" />
              <text fill="currentColor" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="18" x="122" y="106">{i === 0 ? 'executable.exe' : './executable'}</text>
              <path d="M77 120L111 83" className="hf-map__strike" />
            </g>
            <g className="hf-map__record">
              <path d="M80 151h27v35H80zM86 160h15m-15 7h15m-15 7h10M80 219h27v35H80zM86 228h15m-15 7h15m-15 7h10" />
              <text fill="currentColor" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="18" x="122" y="174">{i === 0 ? 'Prefetch / *.pf' : 'auditd / execve'}</text>
              <text fill="currentColor" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="18" x="122" y="242">{i === 0 ? 'NTUSER.DAT / UserAssist' : 'syslog / execution'}</text>
              <path d="M443 161l6 6 12-14M443 229l6 6 12-14" />
            </g>
            <path d="M36 142V240H72" className="hf-map__pulse" pathLength="100" />
          </svg>
        })}
      </div>
      <p className="hf-map__status" aria-live="polite">{deleted ? 'Executable deleted. Independent execution records remain.' : 'Executable present. Independent execution records remain.'}</p>
    </div>
  )
}
