"use client"

import { useRef, useEffect } from "react"
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
      tag: "Submission",
      title: "Submission Requirements",
      description: "GitHub Repository and Demo Video are mandatory.",
      align: "left",
    },
    {
      number: "02",
      tag: "Evaluation",
      title: "Shortlisting Round",
      description: "7 teams shortlisted based on submission for the next round.",
      align: "right",
    },
    {
      number: "03",
      tag: "Results",
      title: "Prizes",
      description: "Results announced on March 10, 2026.",
      rewards: ["1st Prize: ₹7500", "2nd Prize: ₹4500", "3rd Prize: ₹3000"],
      align: "left",
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

      // Staggered cards animation
      const articles = principlesRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        const isRight = principles[index].align === "right"
        gsap.from(article, {
          x: isRight ? 70 : -70,
          y: 30,
          opacity: 0,
          duration: 0.9,
          delay: index * 0.06,
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
        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-accent">03 / Rules</span>
        <h2 className="mt-3 sm:mt-4 font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-7xl tracking-tight">RULES</h2>
        <p className="mt-3 font-mono text-[11px] sm:text-sm text-muted-foreground">Submission, evaluation, and result flow.</p>
      </div>

      {/* Staggered rule blocks */}
      <div ref={principlesRef} className="space-y-8 sm:space-y-10 md:space-y-12">
        {principles.map((principle, index) => (
          <article
            key={index}
            className={`relative border border-border/40 p-5 sm:p-6 md:p-7 min-h-[200px] max-w-3xl ${
              principle.align === "right" ? "md:ml-auto bg-muted/5" : "md:mr-auto bg-background/40"
            }`}
          >
            <div className={principle.align === "right" ? "md:text-right" : "md:text-left"}>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {principle.number} / {principle.tag}
              </span>

              <h3 className="mt-3 font-[var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none text-foreground">
                {principle.title}
              </h3>

              <p className="mt-3 font-mono text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
                {principle.description}
              </p>

              {principle.rewards && (
                <div className="mt-5 space-y-2">
                  {principle.rewards.map((reward) => (
                    <div key={reward} className="border border-border/50 bg-muted/10 px-3 py-2">
                      <p className="font-mono text-[10px] sm:text-xs text-foreground">{reward}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className={`mt-5 h-[1px] ${principle.align === "right" ? "ml-auto" : "mr-auto"} w-20 bg-border`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}