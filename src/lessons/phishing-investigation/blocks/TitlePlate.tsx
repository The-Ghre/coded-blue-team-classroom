import type { TitleBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { MessageSource } from '../MessageSource'

export function TitlePlate({ block, mode, Default }: BlockOverrideProps<TitleBlock>) {
  return <div className="pi-opening" data-mode={mode}>
    <Default block={block} mode={mode} />
    {mode === 'slide' && <MessageSource />}
  </div>
}
