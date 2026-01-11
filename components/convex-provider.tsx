"use client"

import { type ReactNode, useMemo } from "react"
import { ConvexReactClient } from "convex/react"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { Toaster } from "@/components/ui/sonner"

type ConvexProviderProps = {
  children: ReactNode
}

export function ConvexClientProvider({ children }: ConvexProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required for Convex to initialize.")
  }

  const convexClient = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl])

  return (
    <ConvexAuthProvider client={convexClient}>
      {children}
      <Toaster richColors position="top-right" />
    </ConvexAuthProvider>
  )
}
