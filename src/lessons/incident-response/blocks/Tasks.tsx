import type { CSSProperties } from 'react'
import type { TasksBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Duration, MonoLabel } from '@/components/brand/Brand'
import { KitDetail, KitFooter, KitHead } from '../parts'

/* =========================================================================
   TASKS — the task window as one exposure, with the injects marked on it
   =========================================================================
   The shared task list, with the window drawn above it as a strip of film
   on one time axis: each task a frame as long as its minutes, and every
   inject the lead announces marked where it lands. The marks are read from
   the lead itself, so they move with the content; when the lead names no
   injects the strip simply has none.
   ========================================================================= */

function injectMinutes(lead?: string): number[] {
  const m = lead ? /arrive at ([\d,\sand]+?) minutes/i.exec(lead) : null
  if (!m) return []
  return (m[1].match(/\d+/g) ?? []).map(Number).filter((n) => Number.isFinite(n))
}

export default function Tasks({ block, mode }: BlockOverrideProps<TasksBlock>) {
  const total = block.tasks.reduce((t, task) => t + task.minutes, 0)
  const injects = injectMinutes(block.lead).filter((m) => m > 0 && m < total)
  let at = 0

  return (
    <section className="block block--tasks ir-tasks">
      <KitHead block={block} kicker="Student tasks" />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className="tasks__budget">
        <MonoLabel>Suggested timing</MonoLabel>
        <span>
          {block.tasks.length} tasks · {total} minutes total
          {injects.length ? ` · ${injects.length} injects` : ''}
        </span>
      </div>

      <div className="ir-window" aria-hidden="true" style={{ '--total': total } as CSSProperties}>
        <div className="ir-window__film">
          {block.tasks.map((task) => {
            const start = at
            at += task.minutes
            return (
              <span
                key={task.ref}
                className="ir-window__frame"
                style={{ '--start': start, '--len': task.minutes } as CSSProperties}
              >
                <span className="ir-window__ref">{task.ref}</span>
                <span className="ir-window__min">{task.minutes}′</span>
              </span>
            )
          })}
        </div>
        {injects.map((m, i) => (
          <span key={m} className="ir-window__inject" style={{ '--at': m } as CSSProperties}>
            <span className="ir-window__inject-label">
              Inject {i + 1} · {m}′
            </span>
          </span>
        ))}
        <span className="ir-window__axis">
          <span>0′</span>
          <span>{total}′</span>
        </span>
      </div>

      <ol className="tasks__list">
        {block.tasks.map((task) => (
          <li key={task.ref} className="tasks__task">
            <div className="tasks__head">
              <span className="tasks__ref">{task.ref}</span>
              <h4>{task.title}</h4>
              <Duration minutes={task.minutes} />
            </div>
            <ol className="tasks__steps">
              {task.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <div className="tasks__produces">
              <MonoLabel>Produces</MonoLabel>
              {task.produces}
            </div>
          </li>
        ))}
      </ol>
      <KitDetail detail={block.detail} mode={mode} />
      <KitFooter block={block} mode={mode} />
    </section>
  )
}
