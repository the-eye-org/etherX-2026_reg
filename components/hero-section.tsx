"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
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
  const [showRegisterHelp, setShowRegisterHelp] = useState(false)
  const registrations = useQuery(api.registrations.getRegistrations)

  const participantCount = registrations?.length ?? 0
  const teamCount = new Set((registrations ?? []).map((entry) => entry.teamName).filter(Boolean)).size
  const slotsLeft = Math.max(200 - participantCount, 0)
  const teamsLeft = Math.max(50 - teamCount, 0)

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

      {showRegisterHelp && (
        <button
          type="button"
          aria-label="Close registration instructions"
          onClick={() => setShowRegisterHelp(false)}
          className="fixed inset-0 z-40 md:hidden bg-background/55 backdrop-blur-md"
        />
      )}

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:right-12 z-50">
        <button
          type="button"
          onClick={() => setShowRegisterHelp((prev) => !prev)}
          className="border border-border/40 px-3 py-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-accent transition-colors duration-200"
        >
          How to Register
        </button>

        {showRegisterHelp && (
          <div className="mt-2 w-[min(90vw,420px)] border border-border/60 bg-background/95 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">How to Register</p>
              <button
                type="button"
                onClick={() => setShowRegisterHelp(false)}
                className="border border-border/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-accent transition-colors duration-200"
              >
                Close
              </button>
            </div>

            <div className="mt-3 border border-accent/40 bg-accent/10 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Step 1 (Required)</p>
              <p className="mt-1 font-mono text-xs sm:text-sm text-foreground">Sign in with your PSG Tech Google account.</p>
            </div>

            <div className="mt-3 space-y-2">
              <div className="border border-border/50 bg-muted/10 px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 min-w-5 items-center justify-center border border-accent/50 bg-accent/10 px-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-accent">
                    01
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">Join Existing Team</p>
                </div>
                <p className="mt-2 font-mono text-xs sm:text-sm text-foreground">Register Now → Join → Select team → Submit</p>
              </div>

              <div className="border border-border/50 bg-muted/10 px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 min-w-5 items-center justify-center border border-accent/50 bg-accent/10 px-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-accent">
                    02
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">Create New Team</p>
                </div>
                <p className="mt-2 font-mono text-xs sm:text-sm text-foreground">Register Now → Create → Enter team name and size → Submit</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
            <div className="mb-4 sm:mb-5">
              <span className="inline-flex border border-accent/40 bg-accent/10 px-3 py-2 sm:px-4 sm:py-2.5 font-mono text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.24em] text-accent">
                PSG College of Technology × NYU Osiris Lab, USA
              </span>
            </div>
            <SplitFlapText text="ETHERX" speed={80} />
            <div className="mt-4">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className="font-[var(--font-bebas)] text-accent/80 text-[clamp(0.875rem,2vw,2rem)] mt-4 tracking-wide">
          24-Hour Online Hackathon
        </h2>

        <div className="mt-6 sm:mt-12 max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="border border-border/40 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Schedule</p>
            <p className="mt-1 font-mono text-xs sm:text-sm text-foreground">February 28, 7:00 PM IST – March 1, 7:00 PM IST</p>
          </div>

          <div className="border border-border/40 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Eligibility</p>
            <p className="mt-1 font-mono text-xs sm:text-sm text-foreground">Open to all departments and years – PSG Tech</p>
          </div>

          <div className="border border-border/40 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Capacity</p>
            <p className="mt-1 font-mono text-xs sm:text-sm text-foreground">Max 200 participants / 50 teams</p>
          </div>

          <div className="md:hidden border border-border/40 px-3 py-2.5 sm:px-4 sm:py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{registrations === undefined ? "Loading capacity..." : `${slotsLeft} slots / ${teamsLeft} teams left`}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <RegistrationDialog
            trigger={
              <button
                type="button"
                className="group inline-flex items-center gap-2 sm:gap-3 border border-foreground/20 px-4 sm:px-6 py-2.5 sm:py-3 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 whitespace-nowrap"
              >
                <ScrambleTextOnHover text="Register Now" as="span" duration={0.6} />
                <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45 w-4 h-4 sm:w-auto sm:h-auto" />
              </button>
            }
          />
          <a
            href="#signals"
            className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Event Details
          </a>
        </div>
      </div>

      {/* Bottom right info - Desktop only */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 hidden md:block">
        <div className="border border-border/40 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>{registrations === undefined ? "Loading capacity..." : `${slotsLeft} slots / ${teamsLeft} teams left`}</span>
          </div>
        </div>
      </div>
    </section>
  )
}