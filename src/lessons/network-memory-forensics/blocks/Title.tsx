import type { BlockOverrideProps } from '../../types'
import type { TitleBlock } from '@/types/content'
import { Trace } from '../Trace'
export function Title({ block, mode, Default }: BlockOverrideProps<TitleBlock>) {
  return <div className="nm-opening"><Default block={block} mode={mode} /><Trace compact /></div>
}
