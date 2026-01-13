"use client"

import { useEffect, useRef } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapText, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { RegistrationDialog } from "@/components/registration-dialog"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center px-4 sm:px-6 md:pl-28 md:pr-12 py-12 sm:py-0">
      <AnimatedNoise opacity={0.03} />

      {/* Left vertical labels - hidden on mobile */}
      <div className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 hidden sm:block">
        <span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          SIGNAL
        </span>
      </div>

      {/* Main content */}
      <div ref={contentRef} className="flex-1 w-full sm:pl-0">
        <SplitFlapAudioProvider>
          <div className="relative">
            {/* Presenter text */}
            <div className="mb-2 sm:mb-3">
              <span className="font-mono text-[20px] sm:text-s uppercase tracking-[0.3em] text-accent">
                THE EYE Presents,
              </span>
            </div>
            <SplitFlapText text="ETHERX 26" speed={80} />
            <div className="mt-4">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className="font-[var(--font-bebas)] text-accent/80 text-[clamp(0.875rem,2vw,2rem)] mt-4 tracking-wide">
          Flagship multi-stage security challenge
        </h2>

        <p className="mt-6 sm:mt-12 max-w-sm sm:max-w-md font-mono text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Daily remote CTF drops on our portal. Fastest solves rise on the leaderboard. Finalists meet on-site for an
          industry-grade hackathon with full documentation packs, plus side quests like vibe coding and workshops.
        </p>

        <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <RegistrationDialog
            trigger={
              <button
                type="button"
                className="group inline-flex items-center gap-2 sm:gap-3 border border-foreground/20 px-4 sm:px-6 py-2.5 sm:py-3 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 whitespace-nowrap"
              >
                <ScrambleTextOnHover text="Open Registration" as="span" duration={0.6} />
                <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45 w-4 h-4 sm:w-auto sm:h-auto" />
              </button>
            }
          />
          <a
            href="#signals"
            className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Format & Updates
          </a>
        </div>
      </div>

      {/* Bottom right info - Desktop only */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 hidden md:block">
        <div className="border border-border/40 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>2026 Edition</span>
          </div>
        </div>
      </div>
    </section>
  )
}