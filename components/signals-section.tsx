"use client"

import { useRef, useState, useEffect } from "react"
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
}

const signals: Signal[] = [
  {
    date: "2026.01.18",
    title: "Registration Opens",
    note: "PSG CSE-only intake. One submission per teammate; confirm your callsign before locking in.",
    tag: "Live",
    status: "Cohort cap in effect",
  },
  {
    date: "2026.01.20",
    title: "CTF Drops Begin",
    note: "Nightly portal challenges at 18:00 IST. Accuracy + first-blood bonuses mirror the old Cyber Chxse ruleset.",
    tag: "Drops",
  },
  {
    date: "2026.01.24",
    title: "Leaderboard Lock-In",
    note: "Submission timestamps finalize ranking. Ties break on first-blood and clean writeups.",
    tag: "Cutoff",
    status: "Ship before 23:59 IST",
  },
  {
    date: "2026.01.28",
    title: "Workshop Sprint",
    note: "Hands-on labs to rehearse exploit chains, recon, and reporting discipline ahead of on-site play.",
    tag: "Prep",
  },
  {
    date: "2026.02.01",
    title: "Vibe Coding",
    note: "Side quest returns. Lightweight creative build with timeboxed constraints and fast demoing.",
    tag: "Side Track",
  },
  {
    date: "2026.02.05",
    title: "Final Hackathon",
    note: "Top 10–15 teams meet on-site. Industry-grade briefs, scoring dashboards, and a full-day sprint.",
    tag: "Onsite",
  },
]

export function SignalsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const highlight = signals[0]

  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power3.out",
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    section.addEventListener("mousemove", handleMouseMove)
    section.addEventListener("mouseenter", handleMouseEnter)
    section.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      section.removeEventListener("mousemove", handleMouseMove)
      section.removeEventListener("mouseenter", handleMouseEnter)
      section.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in from left
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = cardsRef.current?.querySelectorAll("article")
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="signals" ref={sectionRef} className="relative py-32 pl-6 md:pl-28">
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-12 h-12 rounded-full border-2 border-accent bg-accent",
          "transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Section header */}
      <div ref={headerRef} className="mb-12 pr-6 md:pr-12 flex items-start justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Signals</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">WHAT&apos;S NEW</h2>
          <p className="mt-3 max-w-xl font-mono text-xs text-muted-foreground leading-relaxed">
            Pulled from the Cyber Chxse recap: keep eyes on live drops, bid windows, and on-site check-ins. Everything
            below runs on the same cadence.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className="h-px w-16 bg-border" />
          Fresh intel / EtherX 26
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] pr-6 md:pr-12 items-start">
        {/* Highlight card */}
        <div className="relative overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-accent/10 via-background to-background p-6">
          <div className="absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute -left-24 top-6 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-accent/5 blur-2xl" />
          </div>

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              {highlight.tag}
              <span className="h-3 w-[1px] bg-accent/40" aria-hidden="true" />
              <time className="text-foreground/80">{highlight.date}</time>
            </div>

            <h3 className="font-[var(--font-bebas)] text-4xl leading-tight text-foreground">
              {highlight.title}
            </h3>
            <p className="max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">{highlight.note}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <HighlightItem
                title="Strategy Quiz + Hunt"
                copy="The two-round flow from Cyber Chxse returns: wagering quiz followed by clue-led treasure hunt."
              />
              <HighlightItem
                title="PSG CSE Cohorts"
                copy="Same restriction as last year to keep scoring fair. Keep roll format tight and single-submit."
              />
              <HighlightItem
                title="Scoring Discipline"
                copy="Timestamp-first rankings with first-blood bonuses. Clean writeups can break ties."
              />
              <HighlightItem
                title="Side Tracks"
                copy="Workshops and Vibe Coding run in parallel so you have momentum before the finals."
              />
            </div>
          </div>
        </div>

        {/* Vertical timeline */}
        <div ref={cardsRef} className="relative space-y-4">
          <div className="absolute left-[10px] top-0 h-full w-px bg-border/50" aria-hidden="true" />
          {signals.map((signal, index) => (
            <SignalCard key={signal.title} signal={signal} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SignalCard({
  signal,
  index,
}: {
  signal: Signal
  index: number
}) {
  return (
    <article
      className={cn(
        "group relative flex gap-4 rounded-lg border border-border/50 bg-card/70 p-4 pl-8",
        "transition-transform duration-500 ease-out",
        "hover:-translate-y-1",
      )}
    >
      <div className="absolute left-2 top-6 h-[calc(100%-1.5rem)] w-px bg-accent/40" aria-hidden="true" />

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">{signal.tag}</span>
            <span className="h-3 w-[1px] bg-border" />
            <time className="text-foreground/80">{signal.date}</time>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/60">No. {String(index + 1).padStart(2, "0")}</span>
        </div>

        <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
          {signal.title}
        </h3>

        <p className="font-mono text-xs text-muted-foreground leading-relaxed">{signal.note}</p>

        {signal.status && (
          <p className="inline-flex max-w-max items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {signal.status}
          </p>
        )}
      </div>
    </article>
  )
}

function HighlightItem({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-3">
      <p className="font-[var(--font-bebas)] text-xl text-foreground">{title}</p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-relaxed">{copy}</p>
    </div>
  )
}
