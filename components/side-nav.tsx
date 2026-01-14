"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { cn } from "@/lib/utils"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const navItems = [
  { id: "hero", label: "Index" },
  { id: "signals", label: "Events" },
  { id: "work", label: "Experiments" },
  { id: "principles", label: "Principles" },
  { id: "colophon", label: "Colophon" },
]

export function SideNav() {
  const [activeSection, setActiveSection] = useState("hero")
  const profile = useQuery(api.auth.currentUserProfile)
  const { signOut } = useAuthActions()
  const isLoggedIn = profile !== null

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 },
    )

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="fixed left-0 top-0 z-50 h-screen w-16 md:w-20 hidden md:flex flex-col justify-between border-r border-border/30 bg-background/80 backdrop-blur-sm">
      {/* Navigation items */}
      <div className="flex flex-col gap-6 px-4 py-8">
        {navItems.map(({ id, label }) => (
          <button key={id} onClick={() => scrollToSection(id)} className="group relative flex items-center gap-3">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                activeSection === id ? "bg-accent scale-125" : "bg-muted-foreground/40 group-hover:bg-foreground/60",
              )}
            />
            <span
              className={cn(
                "absolute left-6 font-mono text-[10px] uppercase tracking-widest opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:left-8 whitespace-nowrap",
                activeSection === id ? "text-accent" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* User profile section */}
      {isLoggedIn && (
        <div className="flex flex-col items-center gap-3 px-2 py-6 border-t border-border/30">
          {profile?.profile?.image && (
            <img 
              src={profile.profile.image} 
              alt={profile.profile.name || "User"} 
              className="w-10 h-10 rounded-full object-cover border border-border/60"
              title={profile.profile.name || "User"}
            />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full h-8 px-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-destructive group"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      )}
    </nav>
  )
}
