import type { HeroProps, StageProps } from './types'
import { KitBoundary, useLesson } from './LessonContext'

/**
 * Hosts a kit's ambient layers. Both are decoration: aria-hidden, inert to
 * the pointer, removed from print. The wrapper owns those guarantees so no
 * kit has to remember them.
 */
export function LessonBackdrop(props: StageProps) {
  const { kit } = useLesson()
  if (!kit?.Backdrop) return null
  const Backdrop = kit.Backdrop
  return (
    <div className={`lesson-layer lesson-layer--backdrop lesson-layer--${props.surface}`} aria-hidden="true">
      <KitBoundary label={`${kit.slug} backdrop`}>
        <Backdrop {...props} />
      </KitBoundary>
    </div>
  )
}

export function LessonOverlay(props: StageProps) {
  const { kit } = useLesson()
  if (!kit?.Overlay) return null
  const Overlay = kit.Overlay
  return (
    <div className="lesson-layer lesson-layer--overlay" aria-hidden="true">
      <KitBoundary label={`${kit.slug} overlay`}>
        <Overlay {...props} />
      </KitBoundary>
    </div>
  )
}

/**
 * Renders the kit's Hero in place of the default header, or the default
 * header when the kit has none (or its Hero throws).
 */
export function LessonHero({ fallback, ...props }: HeroProps & { fallback: React.ReactNode }) {
  const { kit } = useLesson()
  if (!kit?.Hero) return <>{fallback}</>
  const Hero = kit.Hero
  return (
    <KitBoundary label={`${kit.slug} hero`} fallback={fallback}>
      <Hero {...props} />
    </KitBoundary>
  )
}
