import type { ReactNode } from 'react'
import { Wordmark } from '@/components/wordmark'

interface Props {
  children: ReactNode
}

/**
 * A guest has no navigation to be given and nowhere to be returned to, so the
 * authentication screens get a shell of their own rather than the application
 * layout with an empty rail.
 *
 * This is the one screen where the brand is a field rather than a detail.
 * DESIGN.md keeps green off the working screens because a green area competes
 * with the data on them; the front door has no data to compete with, and it is
 * the only place the application gets to say what it is.
 *
 * Sem `usePage()`/flash do Inertia: a recusa do login chega como erro da
 * chamada a POST /auth/login, então quem renderiza o aviso é a própria tela.
 */
export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <ClusterField />

        <Wordmark className="relative text-3xl text-primary-foreground" />

        {/* The mark keeps to the upper right and the words to the lower left,
            so neither has to be dimmed to let the other be read.

            Who signs in is the internal team — a `person` has no password and
            never gets here. Explaining what a cluster is to the facilitator who
            runs one every week would be the screen talking past its reader, so
            the one line says why the tool exists instead.

            It breaks at the full stop rather than wherever the browser would:
            the two halves are a parallel, and text-balance was splitting the
            second one so that its first word finished the line above. */}
        <p className="relative max-w-lg text-3xl leading-snug font-medium">
          O trabalho acontece nas equipes.
          <br />O registro acontece aqui.
        </p>
      </aside>

      <main className="flex flex-col px-4 pt-16 pb-10 lg:px-16">
        {/* Anchored to the top rather than centred, so the fields do not move as
            the webfonts arrive. A centred column shifts all of them on every
            load of the one screen everybody starts on. */}
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 lg:mx-0">
          <Wordmark className="text-3xl lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  )
}

// Three clusters, drawn the way the domain describes one: a facilitator with
// the teams that meet at their slot, and the faint lines between hubs that make
// them a chapter. Coordinates are fixed rather than generated — the mark should
// be the same one every time somebody signs in.
const CLUSTERS = [
  { hub: [118, 108], teams: [[58, 58], [182, 52], [62, 178], [176, 164], [116, 26]] },
  { hub: [330, 202], teams: [[268, 140], [398, 148], [392, 268], [278, 258]] },
  { hub: [168, 342], teams: [[92, 300], [108, 408], [238, 396], [246, 298]] },
] as const

function ClusterField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:26px_26px] opacity-15" />
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 size-[30rem] rounded-full bg-primary-foreground/5 blur-3xl" />
      <svg
        viewBox="0 0 460 460"
        className="absolute -top-24 -right-28 h-auto w-[32rem]"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1" opacity="0.35">
          {CLUSTERS.map(({ hub }, index) => {
            const next = CLUSTERS[(index + 1) % CLUSTERS.length]
            return next ? (
              <line key={`chapter-${index}`} x1={hub[0]} y1={hub[1]} x2={next.hub[0]} y2={next.hub[1]} />
            ) : null
          })}
        </g>
        {CLUSTERS.map(({ hub, teams }, index) => (
          <g key={`cluster-${index}`}>
            <g stroke="currentColor" strokeWidth="1" opacity="0.5">
              {teams.map((team) => (
                <line key={`${team[0]}-${team[1]}`} x1={hub[0]} y1={hub[1]} x2={team[0]} y2={team[1]} />
              ))}
            </g>
            {teams.map((team) => (
              <circle
                key={`${team[0]}-${team[1]}`}
                cx={team[0]}
                cy={team[1]}
                r="4"
                fill="currentColor"
                opacity="0.55"
              />
            ))}
            <circle cx={hub[0]} cy={hub[1]} r="7.5" fill="currentColor" opacity="0.95" />
          </g>
        ))}
      </svg>
    </div>
  )
}
