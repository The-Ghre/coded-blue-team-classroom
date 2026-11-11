import { Component, type ReactNode } from 'react'
import type { InteractionBlock } from '@/types/content'
import { TriageConsole } from './TriageConsole'
import { LogInvestigation } from './LogInvestigation'
import { TimelineReconstruct } from './TimelineReconstruct'
import { BeaconAnalyzer } from './BeaconAnalyzer'
import { RuleBuilder } from './RuleBuilder'
import { CoverageMap } from './CoverageMap'

/**
 * An interaction failing must never take the lesson down with it. The
 * boundary degrades to a readable notice so the rest of the slide — which
 * carries the teaching point in prose anyway — still reads.
 */
class InteractionBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="interaction__error">
          <p>
            <strong>This interactive exercise could not be displayed.</strong> The explanation above
            and the debrief below still contain the teaching point, and the practical does not
            depend on it. If this persists, please report it to your instructor.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export function Interaction({
  component,
  data,
}: {
  component: InteractionBlock['component']
  data: unknown
}) {
  let node: ReactNode
  switch (component) {
    case 'triage-console':
      node = <TriageConsole data={data} />
      break
    case 'log-investigation':
      node = <LogInvestigation data={data} />
      break
    case 'timeline-reconstruct':
      node = <TimelineReconstruct data={data} />
      break
    case 'beacon-analyzer':
      node = <BeaconAnalyzer data={data} />
      break
    case 'rule-builder':
      node = <RuleBuilder data={data} />
      break
    case 'coverage-map':
      node = <CoverageMap data={data} />
      break
    default:
      node = <p className="interaction__error">Unknown exercise type.</p>
  }

  return <InteractionBoundary>{node}</InteractionBoundary>
}
