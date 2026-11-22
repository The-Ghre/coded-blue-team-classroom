import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
export function Sheet({ block, mode, Default }: BlockOverrideProps<Block>) {
  return <div className="ad-block" data-kind={block.kind}><Default block={block} mode={mode}/></div>
}
