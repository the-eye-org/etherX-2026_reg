"use client"

import { useRef, useEffect } from "react"
import { HighlightText } from "@/components/highlight-text"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const principlesRef = useRef<HTMLDivElement>(null)

  const principles = [
    {
      number: "01",
      titleParts: [
        { text: "SHIP", highlight: true },
        { text: " FAST", highlight: false },
      ],
      description: "Speed matters: leaderboard ranks by timestamps, so optimize your solve flow.",
      align: "left",
    },
    {
      number: "02",
      titleParts: [
        { text: "READ", highlight: true },
        { text: " THE DOCS", highlight: false },
      ],
      description: "Finals ship with industry-grade briefs—respect constraints, own the details.",
      align: "right",
    },
    {
      number: "03",
      titleParts: [
        { text: "TEAM ", highlight: false },
        { text: "COHESION", highlight: true },
      ],
      description: "Split roles for recon, exploitation, and reporting. Ship together, score together.",
      align: "left",
    },
    {
      number: "04",
      titleParts: [
        { text: "HONEST ", highlight: false },
        { text: "PLAY", highlight: true },
      ],
      description: "No dark patterns, no shortcuts. Clean submissions and transparent teamwork win.",
      align: "right",
    },
  ]

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !principlesRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
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

      // Each principle slides in from its aligned side
      const articles = principlesRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        const isRight = principles[index].align === "right"
        gsap.from(article, {
          x: isRight ? 80 : -80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="principles" className="relative py-20 sm:py-32 px-4 sm:px-6 md:pl-28 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-16 sm:mb-24">
        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-accent">03 / Guidelines</span>
        <h2 className="mt-3 sm:mt-4 font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-7xl tracking-tight">Principles</h2>
      </div>

      {/* Staggered principles */}
      <div ref={principlesRef} className="space-y-16 sm:space-y-24 md:space-y-32">
        {principles.map((principle, index) => (
          <article
            key={index}
            className={`flex flex-col gap-3 sm:gap-0 ${
              principle.align === "right" ? "sm:items-end sm:text-right items-start text-left" : "items-start text-left"
            }`}
          >
            {/* Annotation label */}
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 sm:mb-4">
              {principle.number} / {principle.titleParts[0].text.split(" ")[0]}
            </span>

            <h3 className="font-[var(--font-bebas)] text-2xl sm:text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none">
              {principle.titleParts.map((part, i) =>
                part.highlight ? (
                  <HighlightText key={i} parallaxSpeed={0.6}>
                    {part.text}
                  </HighlightText>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </h3>

            {/* Description */}
            <p className="mt-3 sm:mt-6 max-w-xs sm:max-w-md font-mono text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
              {principle.description}
            </p>

            {/* Decorative line */}
            <div className={`mt-4 sm:mt-8 h-[1px] bg-border w-16 sm:w-24 md:w-48 ${principle.align === "right" ? "mr-0" : "ml-0"}`} />
          </article>
        ))}
      </div>
    </section>
  )
}