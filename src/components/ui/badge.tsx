'use client'

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  className?: string
}

export default function Badge({ children, variant = 'primary', className }: BadgeProps) {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    secondary: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-xs font-medium',
  }

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}
