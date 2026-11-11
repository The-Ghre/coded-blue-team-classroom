import type { ConceptBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { DoubleReset, canDoubleReset } from './DoubleReset'
export function ConceptSheet({ block, mode, Default }: BlockOverrideProps<ConceptBlock>) {
  if (block.id === 'krbtgt' && canDoubleReset(block)) return <DoubleReset block={block} mode={mode}/>
  return <Default block={block} mode={mode}/>
}
