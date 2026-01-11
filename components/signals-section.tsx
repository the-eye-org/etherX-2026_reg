"use client"

import { useRef, useEffect } from "react"
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

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
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

      const cards = cardsRef.current?.querySelectorAll("article")
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="signals" ref={sectionRef} className="relative py-24 px-6 md:px-20 lg:px-32">
      <div ref={headerRef} className="mx-auto max-w-4xl mb-16 space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">What&apos;s New</span>
          <span className="h-px flex-1 bg-border/40" />
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">Fresh drops</h2>
          <span className="rounded-full border border-border/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Quick scan
          </span>
        </div>
        <p className="max-w-2xl font-mono text-sm text-muted-foreground/90 leading-relaxed">
          Time-ordered updates on dates, drops, and on-site checkpoints. Minimal, mobile-ready.
        </p>
      </div>

      <div ref={cardsRef} className="mx-auto max-w-4xl space-y-0">
        {signals.map((signal, index) => (
          <SignalCard key={signal.title} signal={signal} index={index} isLast={index === signals.length - 1} />
        ))}
      </div>
    </section>
  )
}

function SignalCard({
  signal,
  index,
  isLast,
}: {
  signal: Signal
  index: number
  isLast: boolean
}) {
  return (
    <article className={`group relative py-6 ${!isLast ? "border-b border-border/50" : ""} transition-all duration-200 hover:pl-2`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em]">
          <span className="rounded-md bg-accent/10 px-2.5 py-1 text-accent font-medium">{signal.tag}</span>
          <span className="h-3 w-px bg-border/70" />
          <time className="text-muted-foreground">{signal.date}</time>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/60">#{String(index + 1).padStart(2, "0")}</span>
      </div>

      <h3 className="mb-2 font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight text-foreground group-hover:text-accent transition-colors duration-200">
        {signal.title}
      </h3>

      <p className="font-mono text-xs text-muted-foreground/90 leading-relaxed max-w-3xl">
        {signal.note}
      </p>

      {signal.status && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{signal.status}</span>
        </div>
      )}
    </article>
  )
}
