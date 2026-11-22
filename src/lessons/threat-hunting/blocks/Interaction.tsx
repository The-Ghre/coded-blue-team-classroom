import type { BlockOverrideProps } from '../../types'
import type { InteractionBlock } from '@/types/content'
/** The shared map owns every technique, feedback and keyboard behaviour. */
export function InteractionOverride({ block, mode, Default }: BlockOverrideProps<InteractionBlock>) {
  return <div className="hunt-coverage"><Default block={block} mode={mode} /></div>
}
