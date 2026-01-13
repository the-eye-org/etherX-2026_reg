"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type Signal = {
  date: string
  title: string
  note: string
  tag: string
  status?: string
  featured?: boolean
}

const signals: Signal[] = [
  {
    date: "2026.01.12",
    title: "Registration Opens",
    note: "PSG CSE, Msc, ECE and IT intake. One submission per teammate; confirm your callsign before locking in.",
    tag: "Live",
    featured: true,
  },
  {
    date: "2026.01.18 - 2026.01.22",
    title: "CTF Drops",
    note: "5-day challenge series. Nightly portal challenges at 18:00 IST. Accuracy + first-blood bonuses.",
    tag: "Online CTF",
    featured: true,
  },
  {
    date: "2026.01.22",
    title: "Leaderboard Lock-In",
    note: "Submission timestamps finalize ranking. Ties break on first-blood and clean writeups.",
    tag: "Cutoff",
    status: "Ship before 23:59 IST",
  },
  {
    date: "2026.02.23",
    title: "Vibe Coding",
    note: "Non-Technical build challenge. Fun coding sprint with constraints and live demos.",
    tag: "Non-Tech Event",
  },
  {
    date: "2026.02.23",
    title: "Hackathon",
    note: "Top 10–15 teams meet on-site. Industry-grade briefs, scoring dashboards, and a full-day sprint.",
    tag: "Onsite",
    featured: true,
  },
]

export function SignalsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current) return

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Grid cards animation
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(".signal-card")
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }

      // Timeline items animation
      if (timelineRef.current) {
        const items = timelineRef.current.querySelectorAll(".timeline-item")
        gsap.fromTo(
          items,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const featuredSignals = signals.filter(s => s.featured)
  const timelineSignals = signals.filter(s => !s.featured)

  return (
    <section id="signals" ref={sectionRef} className="relative py-20 sm:py-32 px-4 sm:px-6 md:pl-28 md:pr-12">
      {/* Header */}
      <div ref={headerRef} className="mb-12 sm:mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">What&apos;s New</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">Fresh Drops</h2>
        <p className="mt-4 max-w-xl font-mono text-xs text-muted-foreground leading-relaxed">
          Time-ordered updates on dates, drops, and on-site checkpoints.
        </p>
      </div>

      {/* Featured Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-20">
        {featuredSignals.map((signal, index) => (
          <FeaturedCard key={signal.title} signal={signal} index={index} />
        ))}
      </div>

      {/* Timeline Section */}
      {timelineSignals.length > 0 && (
        <div className="flex flex-col items-center">
          <h3 className="mb-8 font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight text-muted-foreground text-center">
            Upcoming
          </h3>
          <div ref={timelineRef} className="relative space-y-0 w-full max-w-3xl">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40 hidden md:block" />
            
            {timelineSignals.map((signal, index) => (
              <TimelineCard key={signal.title} signal={signal} index={index} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function FeaturedCard({ signal, index }: { signal: Signal; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <article
      className={cn(
        "signal-card group relative border border-border/40 p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden min-h-[280px]",
        isHovered && "border-accent/60 bg-accent/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className={cn(
              "block font-mono text-[10px] uppercase tracking-widest transition-colors",
              isHovered ? "text-accent" : "text-muted-foreground"
            )}>
              {signal.tag}
            </span>
            <time className="block font-mono text-[10px] text-muted-foreground/60 mt-1">
              {signal.date}
            </time>
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight transition-colors duration-300 leading-tight",
            isHovered ? "text-accent" : "text-foreground"
          )}
        >
          {signal.title}
        </h3>

        {/* Description */}
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          {signal.note}
        </p>

        {/* Status badge */}
        {signal.status && (
          <div className="inline-flex items-center gap-2 border border-border/60 bg-muted/30 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {signal.status}
            </span>
          </div>
        )}
      </div>

      {/* Corner accent */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-16 h-[1px] transition-all duration-300",
          isHovered ? "bg-accent w-24" : "bg-border/40"
        )}
      />
      
      {/* Top right corner decoration */}
      <div
        className={cn(
          "absolute top-0 right-0 w-12 h-12 transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute top-0 right-0 w-full h-[1px] bg-accent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-accent" />
      </div>
    </article>
  )
}

function TimelineCard({ signal, index }: { signal: Signal; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <article
      className={cn(
        "timeline-item relative pl-0 md:pl-12 py-6 border-b border-border/40 last:border-b-0 transition-all duration-200",
        isHovered && "pl-1 md:pl-14"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline dot */}
      <div className="absolute left-0 top-8 hidden md:block">
        <div
          className={cn(
            "w-2 h-2 -translate-x-1/2 transition-all duration-300",
            isHovered ? "bg-accent scale-150" : "bg-border/60"
          )}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        {/* Date & Tag */}
        <div className="sm:min-w-[180px]">
          <time className="block font-mono text-[10px] text-foreground">
            {signal.date}
          </time>
          <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
            {signal.tag}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={cn(
              "mb-2 font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight transition-colors duration-200",
              isHovered ? "text-accent" : "text-foreground"
            )}
          >
            {signal.title}
          </h3>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-2xl">
            {signal.note}
          </p>
          
          {signal.status && (
            <div className="mt-3 inline-flex items-center gap-2 border border-border/60 bg-muted/30 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {signal.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}