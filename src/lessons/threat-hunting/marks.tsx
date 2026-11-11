/* Pencil marks, drawn in the same stroke as the tick the lamp leaves on an
   examined stamp. Decorative: every use sits beside the word it marks. */

type Kind = 'tick' | 'cross' | 'rule' | 'wave'

const PATHS: Record<Kind, string> = {
  tick: 'M3 10.5 L7.5 15 L17 4',
  cross: 'M4.5 4.5 L15.5 15.5 M15.5 4.5 L4.5 15.5',
  rule: 'M3 10 H17 M3 13.5 H17',
  wave: 'M2.5 11 C5 6.5, 7.5 6.5, 10 11 S15 15.5, 17.5 11',
}

export function Mark({ kind, className = '' }: { kind: Kind; className?: string }) {
  return (
    <svg
      className={`th-pencil ${className}`}
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={PATHS[kind]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
