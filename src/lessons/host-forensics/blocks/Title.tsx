import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { getSession } from '@/content'
import { SplitWords } from '@/motion'
import { Plaque } from './parts'

/**
 * The opening slide: the session number set at full height, the subject
 * beneath it in the two carpets' own tints, and the lesson's thesis line.
 * The overline becomes the threshold's brass plaque, under the thesis.
 */
export function Title({ block, mode }: BlockOverrideProps<TitleBlock>) {
  // On a reading page the hero already carries the session title in the
  // page's only h1, so the block steps down a level and drops the subject.
  const Heading = mode === 'slide' ? 'h1' : 'h2'
  const session = getSession('host-forensics')
  const subject = mode === 'slide' ? (session?.title ?? '') : ''
  const [head, tail] = subject.includes(':') ? subject.split(/:\s*/, 2) : [subject, '']
  return (
    <section className="block block--title hf-title">
      <Heading className="block--title__h hf-title__h">{block.title}</Heading>
      {subject && (
        <p className="hf-title__subject">
          <span className="hf-title__subject-head">{head}</span>
          {tail && (
            <span className="hf-title__subject-tail">
              {tail.split(/(\bWindows\b|\bLinux\b)/).map((part, i) =>
                part === 'Windows' ? (
                  <span key={i} className="hf-ink-windows">
                    Windows
                  </span>
                ) : part === 'Linux' ? (
                  <span key={i} className="hf-ink-linux">
                    Linux
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </span>
          )}
        </p>
      )}
      {block.lead && <SplitWords as="p" className="block--title__lead hf-title__lead" text={block.lead} />}
      <Plaque className="hf-title__plaque">{block.overline}</Plaque>
    </section>
  )
}
