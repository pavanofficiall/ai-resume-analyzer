import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-primary border-t-transparent h-6 w-6", className)} />
  )
}
