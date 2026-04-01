import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-violet-100/80 bg-white/90 px-3 py-2 text-sm text-slate-800 transition-all duration-200 shadow-elegant',
          'placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-black/40 dark:border-white/10 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:ring-violet-300 dark:focus-visible:ring-offset-[#070812]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
