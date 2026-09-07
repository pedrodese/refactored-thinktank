import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'

/**
 * The domain's states, mapped to a tone in one place so no screen has to
 * remember the contrast rule. Every tone is a tinted surface with its own
 * foreground and boundary: three visual cues, none of which is load-bearing,
 * because the label the caller passes is what carries the meaning.
 *
 * The brand's lime and yellow are not used here, and are no longer in the
 * palette at all: they were sampled from full-bleed campaign sections and are
 * too saturated to sit twenty times in one column. Yellow's hue survives as the
 * pending tone at a tenth of its chroma, which was the part carrying meaning.
 */
type Tone = 'pending' | 'complete' | 'neutral' | 'destructive' | 'emphasis'

const TONE_CLASSES: Record<Tone, string> = {
  pending: 'bg-status-pending text-status-pending-foreground border-status-pending-border',
  complete: 'bg-status-complete text-status-complete-foreground border-status-complete-border',
  neutral: 'bg-status-neutral text-status-neutral-foreground border-status-neutral-border',
  destructive:
    'bg-status-destructive text-status-destructive-foreground border-status-destructive-border',
  emphasis: 'bg-status-emphasis text-status-emphasis-foreground border-status-emphasis-border',
}

interface Props {
  tone: Tone
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ tone, children, className }: Props) {
  return <Badge className={cn(TONE_CLASSES[tone], className)}>{children}</Badge>
}
