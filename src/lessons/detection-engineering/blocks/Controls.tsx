import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'

/** Use the player's existing key-ownership contract for native exercise controls. */
export function Controls<B extends Block>({ block, mode, Default }: BlockOverrideProps<B>) {
  return <div data-keys-own><Default block={block} mode={mode} /></div>
}
