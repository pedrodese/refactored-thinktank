/**
 * The application's name, set in the display face. It replaces the logo mark:
 * one word carries the identity in the chrome, and the picture it replaces cost
 * a request and a reserved box on every screen.
 */
interface Props {
  className?: string
}

export function Wordmark({ className = 'text-xl' }: Props) {
  return <span className={`font-display font-semibold tracking-tight text-primary ${className}`}>Thinktank</span>
}
