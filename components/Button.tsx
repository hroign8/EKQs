import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonBaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
}

interface ButtonAsButton extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: never
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string
  target?: string
  rel?: string
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gold-500 hover:bg-gold-400 text-burgundy-900 font-bold',
  secondary: 'bg-burgundy-900 hover:bg-burgundy-800 text-white font-semibold',
  outline: 'border-2 border-burgundy-900 text-burgundy-900 hover:bg-burgundy-50 font-semibold',
  ghost: 'bg-white/10 hover:bg-white/20 text-white font-medium',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm sm:text-base',
  lg: 'px-8 py-3 text-sm sm:text-base',
}

/**
 * Shared button component with consistent styling across the app.
 * Renders as a `<Link>` when `href` is provided, otherwise a `<button>`.
 */
export default function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full transition-colors'
  const classes = `${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  if ('href' in props && props.href) {
    const { href, target, rel, ...rest } = props as ButtonAsLink
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    )
  }

  const { ...buttonProps } = props as ButtonAsButton
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
