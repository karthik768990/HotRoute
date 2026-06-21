import * as React from "react"
import { cn } from "@/lib/utils"

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      {...props}
    >
      {/* Pillars adapt to current text color */}
      <rect x="5" y="3" width="4" height="18" rx="1" fill="currentColor" />
      <rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor" />
      {/* Crossbar uses the primary color of the theme */}
      <path
        d="M9 12L15 12"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
