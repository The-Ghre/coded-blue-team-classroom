import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Query } from './Query'
import { Title } from './Title'

/** A stable scroll surface: scrolling never remounts an exercise or loses answers. */
export function ReadingPane<B extends Block>({ block, mode, Default }: BlockOverrideProps<B>) {
  const content = block.kind === 'query'
    ? <Query block={block} mode={mode} Default={Default as never} />
    : block.kind === 'title'
      ? <Title block={block} mode={mode} Default={Default as never} />
      : <Default block={block} mode={mode} />
  return <div className="de-reading" data-keys-own>
    {mode === 'slide' && <p className="de-reading__hint">Reading pane · focus here and use ↑ / ↓ to read more</p>}
    <div className="de-reading__body" role="region" aria-label={`${block.title} reading pane`} tabIndex={mode === 'slide' ? 0 : undefined}>
      {content}
    </div>
  </div>
}
