'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card p-4">
      <Skeleton className="h-40 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th><Skeleton className="h-4 w-20" /></th>
            <th><Skeleton className="h-4 w-32" /></th>
            <th><Skeleton className="h-4 w-24" /></th>
            <th><Skeleton className="h-4 w-16" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><Skeleton className="h-4 w-full" /></td>
              <td><Skeleton className="h-4 w-full" /></td>
              <td><Skeleton className="h-4 w-full" /></td>
              <td><Skeleton className="h-4 w-full" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
