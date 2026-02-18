"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      // Grid columns fade up with stagger
      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      // Footer fade in
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="colophon"
      className="relative py-20 sm:py-32 px-4 sm:px-6 md:pl-28 md:pr-12 border-t border-border/30"
    >
      {/* Section header */}
      <div ref={headerRef} className="mb-12 sm:mb-16">
        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-accent">04 / Summary</span>
        <h2 className="mt-3 sm:mt-4 font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-7xl tracking-tight">EVENT SNAPSHOT</h2>
      </div>

      {/* Multi-column layout */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-12">
        {/* Design */}
        <div className="col-span-1">
          <h4 className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-3 sm:mb-4">Event</h4>
          <ul className="space-y-1 sm:space-y-2">
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">International Cybersecurity Hackathon</li>
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">24-Hour Online Hackathon</li>
          </ul>
        </div>

        {/* Stack
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Stack</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Next.js + Convex</li>
            <li className="font-mono text-xs text-foreground/80">Auth & Leaderboard</li>
            <li className="font-mono text-xs text-foreground/80">Sonner Alerts</li>
          </ul>
        </div> */}

        {/* Typography */}
        <div className="col-span-1">
          <h4 className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-3 sm:mb-4">Hosts</h4>
          <ul className="space-y-1 sm:space-y-2">
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">PSG College of Technology</li>
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">NYU Osiris Lab</li>
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">New York University, USA</li>
          </ul>
        </div>

        {/* Location */}
        <div className="col-span-1">
          <h4 className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-3 sm:mb-4">Schedule</h4>
          <ul className="space-y-1 sm:space-y-2">
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">Feb 28, 7:00 PM IST</li>
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">Mar 1, 7:00 PM IST</li>
          </ul>
        </div>

        

        {/* capacity */}
        <div className="col-span-1 hidden sm:block">
          <h4 className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-3 sm:mb-4">Capacity</h4>
          <ul className="space-y-1 sm:space-y-2">
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">Max 200 participants</li>
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">Max 50 teams</li>
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">Team size: 3–5</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-1">
          <h4 className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-3 sm:mb-4">Contact</h4>
          <ul className="space-y-1 sm:space-y-2">
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">Neelesh — +91 XXXXX XXXXX</li>
            <li className="font-mono text-[10px] sm:text-xs text-foreground/80">Thrisha — +91 XXXXX XXXXX</li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div
        ref={footerRef}
        className="mt-16 sm:mt-24 pt-6 sm:pt-8 border-t border-border/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
      >
        <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2026 International Cybersecurity Hackathon
        </p>
        <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">PSG College of Technology × NYU Osiris Lab</p>
      </div>
    </section>
  )
}