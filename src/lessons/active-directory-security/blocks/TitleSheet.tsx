import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { AccessGraph } from '../AccessGraph'
export function TitleSheet({ block }: BlockOverrideProps<TitleBlock>) {
  return <section className="block block--title ad-title"><h1>{block.title}</h1><p className="ad-title__subject">Active Directory Security</p><AccessGraph/><p className="block--title__lead">{block.lead}</p><p className="ad-title__meta">{block.overline}</p></section>
}
