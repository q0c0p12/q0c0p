"use client"

import type { ReactNode } from "react"
import { useSidebar } from "@/lib/sidebar-context"

export function ResponsiveWrapper({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar()

  return <div className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}>{children}</div>
}
