import type { HeroProps } from '../types'
import { Plaque } from './blocks/parts'

/* =========================================================================
   HERO — the two carpets meet under the title
   =========================================================================
   The title is laid across the floor: the subject on the first line, the
   two platforms beneath it, each word in its own carpet's tint. The page's
   eyebrow becomes the threshold's brass plaque; lead and actions follow.
   ========================================================================= */

function Platforms({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\bWindows\b|\bLinux\b)/).map((part, i) =>
        part === 'Windows' ? (
          <span key={i} className="hf-ink-windows">
            Windows
          </span>
        ) : part === 'Linux' ? (
          <span key={i} className="hf-ink-linux">
            Linux
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function Hero({ session, eyebrow, lead, actions, surface }: HeroProps) {
  const [head, tail] = session.title.includes(':') ? session.title.split(/:\s*/, 2) : [session.title, '']
  return (
    <header className={`hf-hero hf-hero--${surface}`}>
      <h1 className="hf-hero__title">
        <span className="hf-hero__head">
          {head}
          {/* Visually hidden on screen, where the lines stack; on paper it
              keeps "Host Forensics: Windows and Linux" one readable title. */}
          {tail && <span className="hf-sep">: </span>}
        </span>
        {tail && (
          <span className="hf-hero__tail">
            <Platforms text={tail} />
          </span>
        )}
      </h1>
      <Plaque className="hf-hero__plaque">{eyebrow}</Plaque>
      {lead && <div className="hf-hero__lead lead">{lead}</div>}
      {actions && <div className="hf-hero__actions">{actions}</div>}
    </header>
  )
}
