import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { EvidenceBlock } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { KitDetail, KitFooter, KitHead } from '../parts'

/* =========================================================================
   CHAIN OF CUSTODY — a record in a negative sleeve
   =========================================================================
   The custody record keeps the shared annotator's behaviour: every line is
   a button that opens what it defends against. Every note is rendered, and
   hidden until opened, so a printed handout carries all of them.

   Every sha256 value in the record is drawn as an edge code: a bar pattern
   read straight off the hex digits. Matching values print identical codes,
   so the three hashes register on top of one another — the custody argument
   as something you can see. "Flip one bit" hashes a short text and the
   same text with one bit changed, live, and the codes stop registering.
   ========================================================================= */

const HASH_RE = /sha256\s+([0-9a-f]{64})/i

export default function Custody({ block, mode, Default }: BlockOverrideProps<EvidenceBlock>) {
  const hashes = block.lines
    .map((l, i) => ({ i, text: l.text, hash: HASH_RE.exec(l.text)?.[1]?.toLowerCase() }))
    .filter((h): h is { i: number; text: string; hash: string } => !!h.hash)

  /* Only a record carrying hashes is a custody record; anything else keeps
     the shared annotator untouched. */
  if (hashes.length < 2) return <Default block={block} mode={mode} />
  return <CustodyRecord block={block} mode={mode} hashes={hashes} />
}

function CustodyRecord({
  block,
  mode,
  hashes,
}: {
  block: EvidenceBlock
  mode: BlockOverrideProps<EvidenceBlock>['mode']
  hashes: { i: number; text: string; hash: string }[]
}) {
  const [open, setOpen] = useState<number | null>(null)
  const panelId = useId()
  const allMatch = hashes.every((h) => h.hash === hashes[0].hash)

  return (
    <section className="block block--evidence ir-custody">
      <KitHead block={block} kicker="Annotated evidence" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="ir-custody__layout">
        <div className="evidence ir-sleeve">
          <div className="evidence__head">
            <MonoLabel>{block.caption}</MonoLabel>
            <span className="evidence__hint">Select a line to annotate it</span>
          </div>

          <ol className="evidence__lines">
            {block.lines.map((line, i) => {
              const isOpen = open === i
              const hash = HASH_RE.exec(line.text)?.[1]
              if (!line.note) {
                return (
                  <li key={i} className="evidence__line-wrap">
                    <div className="evidence__line">
                      <span className="evidence__marker evidence__marker--none" aria-hidden="true">
                        ·
                      </span>
                      <code>{line.text}</code>
                    </div>
                  </li>
                )
              }
              return (
                <li key={i} className="evidence__line-wrap" data-hash={hash ? 'true' : undefined}>
                  <button
                    type="button"
                    className={`evidence__line evidence__line--interactive${isOpen ? ' is-open' : ''}`}
                    data-kind={line.note.kind}
                    aria-expanded={isOpen}
                    aria-controls={`${panelId}-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="evidence__marker" aria-hidden="true">
                      {EVIDENCE_META[line.note.kind].glyph}
                    </span>
                    <code>{line.text}</code>
                    {hash && <EdgeCode hash={hash} className="ir-sleeve__code" />}
                  </button>
                  <div
                    className="evidence__note"
                    id={`${panelId}-${i}`}
                    data-kind={line.note.kind}
                    hidden={!isOpen}
                  >
                    <div className="evidence__note-head">
                      <EvidenceChip kind={line.note.kind} />
                      <strong>{line.note.label}</strong>
                    </div>
                    <p>{line.note.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <Registration
          hashes={hashes}
          allMatch={allMatch}
          sample={block.lines.find((l) => !HASH_RE.test(l.text))?.text.replace(/\s+/g, ' ') ?? block.caption}
        />
      </div>

      <div className="proves">
        <div className="proves__col proves__col--yes">
          <div className="proves__head">
            <EvidenceChip kind="confirmed" label="This establishes" />
          </div>
          <ul>
            {block.proves.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="proves__col proves__col--no">
          <div className="proves__head">
            <EvidenceChip kind="uncertain" label="This does not establish" />
          </div>
          <ul>
            {block.doesNotProve.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <KitDetail detail={block.detail} mode={mode} />
      <KitFooter block={block} mode={mode} />
    </section>
  )
}

/* ---------- Edge code: a hash drawn as bars ------------------------------ */

function EdgeCode({ hash, className, style }: { hash: string; className?: string; style?: CSSProperties }) {
  const bars = useMemo(() => {
    const out: { x: number; w: number }[] = []
    let x = 0
    for (const ch of hash.slice(0, 48)) {
      const v = parseInt(ch, 16)
      const w = 1 + (v & 3)
      const gap = 1 + (v >> 2)
      out.push({ x, w })
      x += w + gap
    }
    return { out, width: x }
  }, [hash])
  return (
    <svg
      className={`ir-code${className ? ` ${className}` : ''}`}
      style={style}
      viewBox={`0 0 ${bars.width} 10`}
      width="0"
      height="0"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {bars.out.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={10} />
      ))}
    </svg>
  )
}

/* ---------- Registration: the three hashes, overlaid --------------------- */

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function Registration({
  hashes,
  allMatch,
  sample,
}: {
  hashes: { i: number; text: string; hash: string }[]
  allMatch: boolean
  /** A line of the record to hash live for the bit-flip demonstration. */
  sample: string
}) {
  const [demo, setDemo] = useState<null | { a: string; b: string }>(null)
  const [busy, setBusy] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  /* The codes slide into register the first time the panel is in view. */
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  async function flip() {
    if (demo) {
      setDemo(null)
      return
    }
    if (!globalThis.crypto?.subtle) {
      setUnsupported(true)
      return
    }
    setBusy(true)
    try {
      const source = new TextEncoder().encode(sample)
      const changed = new Uint8Array(source)
      changed[changed.length - 1] ^= 0x01
      const [a, b] = await Promise.all([sha256Hex(source), sha256Hex(changed)])
      setDemo({ a, b })
    } catch {
      setUnsupported(true)
    } finally {
      setBusy(false)
    }
  }

  const stageLabel = (t: string) => t.replace(/:.*/, '').trim()

  return (
    <div className="ir-reg" ref={ref} data-seen={seen || undefined} data-demo={demo ? 'true' : undefined}>
      <MonoLabel>Registration · every hash in this record</MonoLabel>
      <div className="ir-reg__stack" aria-hidden="true">
        {demo
          ? [demo.a, demo.b].map((h, k) => (
              <EdgeCode
                key={`demo-${k}`}
                hash={h}
                className={`ir-reg__code${k === 1 ? ' ir-reg__code--foreign' : ''}`}
                style={{ '--k': k } as CSSProperties}
              />
            ))
          : hashes.map((h, k) => (
              <EdgeCode key={h.i} hash={h.hash} className="ir-reg__code" style={{ '--k': k } as CSSProperties} />
            ))}
      </div>
      <ul className="ir-reg__stages">
        {demo ? (
          <>
            <li>
              <span>Sample line</span>
              <code>{demo.a.slice(0, 8)}…{demo.a.slice(-6)}</code>
            </li>
            <li data-foreign="true">
              <span>Same line, one bit flipped</span>
              <code>{demo.b.slice(0, 8)}…{demo.b.slice(-6)}</code>
            </li>
          </>
        ) : (
          hashes.map((h) => (
            <li key={h.i}>
              <span>{stageLabel(h.text)}</span>
              <code>{h.hash.slice(0, 8)}…{h.hash.slice(-6)}</code>
            </li>
          ))
        )}
      </ul>
      <p className="ir-reg__verdict" data-match={allMatch && !demo ? 'true' : 'false'}>
        {demo
          ? 'Out of register. One flipped bit, a completely different value — in a real record, stop here: document the discrepancy and escalate.'
          : allMatch
            ? `In register: all ${hashes.length} values are identical.`
            : 'Out of register: the values differ.'}
      </p>

      <div className="ir-reg__demo">
        <button type="button" className="btn btn--sm" onClick={flip} disabled={busy} aria-pressed={!!demo}>
          {demo ? 'Restore the bit' : 'Flip one bit'}
        </button>
        <p className="ir-reg__demo-note" role="status" aria-live="polite">
          {unsupported
            ? 'This browser does not expose SHA-256 to the page, so the demonstration cannot run here.'
            : demo
              ? (
                  <>
                    Computed live in this browser: SHA-256 of <code>{sample}</code>, then of the same
                    text with its last bit flipped.
                  </>
                )
              : 'A live demonstration, computed in this browser: hash one line of this record, then the same line with one bit changed.'}
        </p>
      </div>
    </div>
  )
}
