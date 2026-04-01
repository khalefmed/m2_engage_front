import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-violet-300 dark:focus-visible:ring-offset-[#070812] active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-elegant-lg hover:from-violet-500 hover:to-blue-500',
        secondary: 'bg-white/85 text-slate-800 border border-violet-100/80 shadow-elegant hover:bg-white dark:bg-white/5 dark:text-slate-100 dark:border-white/10 dark:hover:bg-white/10 backdrop-blur',
        ghost: 'text-slate-700 hover:bg-violet-50 dark:text-slate-200 dark:hover:bg-white/10',
        link: 'underline-offset-4 hover:underline text-violet-700 dark:text-violet-300',
        destructive: 'bg-red-600 text-white shadow-elegant hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
