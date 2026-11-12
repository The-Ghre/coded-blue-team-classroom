import { createServer } from 'vite'
import assert from 'node:assert/strict'
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, cacheDir: '/tmp/coded-presentation-check-cache' })
try {
  const { sessions, getBlock } = await server.ssrLoadModule('/src/content/index.ts')
  const { presentationPlans, getPresentation, buildCount } = await server.ssrLoadModule('/src/content/presentations/index.ts')
  const words = text => text.trim().split(/\s+/).length
  let total = 0
  for (const session of sessions) {
    const plan = presentationPlans.find(plan => plan.slug === session.slug)
    assert(plan, `Missing plan: ${session.slug}`)
    assert(plan.chapters.some(c => c.half === 'practical'), `${session.slug}: missing workshop`)
    const frames = getPresentation(session)
    assert.equal(new Set(frames.map(f => f.id)).size, frames.length, `${session.slug}: duplicate frame ID`)
    for (const chapter of plan.chapters) {
      assert(chapter.outline.length >= 3 && chapter.outline.length <= 4, `${session.slug}: section outline`)
      for (const beat of chapter.beats) {
        const at = `${session.slug}/${beat.id}`
        assert(getBlock(session, beat.sourceId), `${at}: invalid source ${beat.sourceId}`)
        assert(words(beat.title) <= 10, `${at}: title too long`)
        assert((beat.points?.length ?? 0) <= 4, `${at}: too many bullets`)
        for (const point of [...(beat.points ?? []), ...(beat.columns ?? []).flatMap(c => c.points)]) assert(words(point) <= 14, `${at}: long bullet: ${point}`)
        assert((beat.steps?.length ?? 0) <= 5, `${at}: too many steps`)
        assert((beat.lines?.length ?? 0) <= 5, `${at}: too many evidence lines`)
        for (const line of beat.lines ?? []) assert(line.text.length <= 48, `${at}: long evidence line`)
        assert(!beat.takeaway || words(beat.takeaway) <= 16, `${at}: long takeaway`)
      }
    }
    assert.equal(buildCount(frames[0]), 0)
    total += frames.length
    console.log(`${session.slug}: ${frames.length} slides, ${plan.chapters.length} sections`)
  }
  console.log(`Presentation integrity passed: ${sessions.length} lessons, ${total} slides.`)
} finally { await server.close() }
