import type { BlockOverrideProps } from '../../types'
import type { TitleBlock } from '@/types/content'
import { Distribution } from '../Distribution'
export function TitleOverride({ block, mode }: BlockOverrideProps<TitleBlock>) {
  return <section className={`block block--title th-title th-title--${mode}`}>
    <h1 className="block--title__h">{block.title}</h1>
    <p className="th-title__overline">{block.overline}</p>
    {block.lead && <p className="block--title__lead">{block.lead}</p>}
    {mode === 'slide' && <Distribution />}
  </section>
}
