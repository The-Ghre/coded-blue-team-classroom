import type { BlockOverrideProps } from '../types'
import type { TitleBlock as Title } from '@/types/content'
import { AlertFlow } from './Backdrop'

export function TitleBlock({ block, mode, Default }: BlockOverrideProps<Title>) {
  return <div className="soc-opening">
    <Default block={block} mode={mode} />
    <div className="soc-opening__flow" aria-hidden="true"><AlertFlow /></div>
  </div>
}
