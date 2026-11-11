import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { RuleField } from '../RuleField'
export function Title({ block, mode, Default }: BlockOverrideProps<TitleBlock>) {
  if (mode !== 'slide') return <Default block={block} mode={mode} />
  return <section className="block block--title de-title"><div><h1 className="block--title__h">{block.title}</h1><p>{block.overline}</p>{block.lead && <p className="block--title__lead">{block.lead}</p>}</div><RuleField /></section>
}
