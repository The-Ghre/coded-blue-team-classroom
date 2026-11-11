import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Bubble } from './parts'

/**
 * Every block the world does not rebuild keeps the shared renderer, set on
 * a sheet with its detail bubble, so content edits flow straight through.
 */
export function Sheet({ block, mode, Default }: BlockOverrideProps<Block>) {
  return (
    <div className="adw-wrap" data-kind={block.kind}>
      <Bubble id={block.id} />
      <Default block={block} mode={mode} />
    </div>
  )
}
