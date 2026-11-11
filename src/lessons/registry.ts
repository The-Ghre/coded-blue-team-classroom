import type { LessonKit } from './types'

/**
 * One lazy loader per session slug. Each kit is its own chunk, with its own
 * CSS, so lessons never pay for each other's art.
 *
 * Keyed by slug rather than session number so renumbering sessions in
 * src/content never silently reassigns a world to the wrong lesson.
 */
export const lessonLoaders: Record<string, () => Promise<{ default: LessonKit }>> = {
  'soc-operations': () => import('./soc-operations'),
  'log-analysis': () => import('./log-analysis'),
  'phishing-investigation': () => import('./phishing-investigation'),
  'detection-engineering': () => import('./detection-engineering'),
  'incident-response': () => import('./incident-response'),
  'host-forensics': () => import('./host-forensics'),
  'network-memory-forensics': () => import('./network-memory-forensics'),
  'malware-analysis': () => import('./malware-analysis'),
  'threat-hunting': () => import('./threat-hunting'),
  'active-directory-security': () => import('./active-directory-security'),
}
