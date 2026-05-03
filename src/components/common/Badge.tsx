import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-500/12 text-emerald-700 ring-1 ring-inset ring-emerald-500/20',
        warning: 'bg-amber-500/12 text-amber-700 ring-1 ring-inset ring-amber-500/20',
        danger: 'bg-red-500/12 text-red-700 ring-1 ring-inset ring-red-500/20',
        info: 'bg-violet-500/12 text-violet-700 ring-1 ring-inset ring-violet-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
