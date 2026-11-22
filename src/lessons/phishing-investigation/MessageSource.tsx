import { useState } from 'react'

/** A labelled, invented specimen. It never requests or links to any host. */
export function MessageSource() {
  const [source, setSource] = useState(true)
  return (
    <figure className="pi-message" data-source={source}>
      <div className="pi-message__drawing" aria-hidden="true">
        <svg viewBox="0 0 560 420" focusable="false">
          <g className="pi-source">
            <path className="pi-source__sheet" d="M46 100H478L518 140V384H46Z" />
            <path className="pi-source__fold" d="M478 100V140H518" />
            <text x="72" y="178" className="pi-source__field">Return-Path:</text>
            <text x="72" y="203" className="pi-source__value">billing@review[.]example</text>
            <path className="pi-route" d="M82 327V249H115M82 288H115M82 327H115" />
            {[249, 288, 327].map((y, i) => <g key={y}>
              <rect className="pi-hop" x="75" y={y - 7} width="14" height="14" />
              <text className="pi-source__field" x="125" y={y + 6}>Received: {['mailbox', 'relay', 'origin'][i]}</text>
            </g>)}
            <path className="pi-route__arrow" d="M77 258L82 249L87 258" />
            <path className="pi-destination" d="M310 234H477V342H310Z" />
            <text x="326" y="261" className="pi-source__small">href destination</text>
            <path className="pi-link" d="M330 280H456M330 285H456" />
            <text x="326" y="315" className="pi-source__small">review[.]example</text>
          </g>
          <g className="pi-envelope">
            <rect x="63" y="35" width="423" height="185" rx="2" />
            <path d="M63 35L274 153L486 35M63 220L200 112M486 220L349 112" />
            <rect className="pi-envelope__seal" x="246" y="125" width="57" height="39" rx="2" />
          </g>
        </svg>
      </div>
      <figcaption className="pi-message__caption">
        <span>Synthetic message · .example</span>
        <button type="button" onKeyDown={event => {
          if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) event.stopPropagation()
        }} aria-pressed={source} onClick={() => setSource(!source)}>
          {source ? 'Show message' : 'Inspect source'}
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12H20M14 6L20 12L14 18" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
      </figcaption>
    </figure>
  )
}
