import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { TraceMap } from '../TraceMap'
export function Title({ block, mode, Default }: BlockOverrideProps<TitleBlock>) {
  return <div className="hf-title"><Default block={block} mode={mode} /><TraceMap /></div>
}
