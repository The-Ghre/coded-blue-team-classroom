import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Acquisition, useKitSession } from '../parts'
export default function Title({ block }: BlockOverrideProps<TitleBlock>) {
  const session = useKitSession()
  return <section className="block block--title ir-title">
    <div><h1 className="block--title__h">{session?.title ?? block.title}</h1><p className="ir-context">{block.overline} · {block.title}</p>{block.lead && <p className="block--title__lead">{block.lead}</p>}
    {session && <ul className="ir-themes">{session.themes.map(t => <li key={t}>{t}</li>)}</ul>}</div><Acquisition />
  </section>
}
