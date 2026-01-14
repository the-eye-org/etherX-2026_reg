"use client"

import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { cn } from "@/lib/utils"
import { motion, type Variants } from "framer-motion"

const breakdown = [
	{
		title: "Technical Arena",
		amount: "5K",
		summary: "Capture the flag gauntlets, protocol tear-downs, and elite hack-offs.",
	},
	{
		title: "Non-Technical Arena",
		amount: "5K",
		summary: "Pitch decks, strategy battles, rapid ideation, and storytelling showdowns.",
	},
]

const gridVariants: Variants = {
	hidden: {},
	show: {
		transition: {
			staggerChildren: 0.14,
			delayChildren: 0.1,
		},
	},
}

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 20, rotateX: -4 },
	show: {
		opacity: 1,
		y: 0,
		rotateX: 0,
		transition: { duration: 0.6, ease: "easeOut" },
	},
}

export function PrizeSection() {
	return (
		<section
			id="prize"
			className="relative overflow-hidden px-4 sm:px-6 md:px-28 py-20 sm:py-28"
		>
			<AnimatedNoise opacity={0.015} />
			<div className="mx-auto max-w-6xl">
				<motion.div
					className="flex flex-col gap-12 lg:flex-row lg:items-end"
					initial={{ opacity: 0, y: 32 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.35 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<div className="flex-1 space-y-6">
						<span className="font-mono text-3xl uppercase tracking-[0.32em] text-accent/80">
							Prize Pool
						</span>
						<div className="relative inline-flex items-center gap-6">
							<div className="absolute inset-0 rounded-full bg-accent/10 blur-3xl" />
							<span className="relative font-[var(--font-bebas)] text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-none text-accent">
								10K
							</span>
							<span className="relative inline-flex items-center gap-2 rounded-full border border-accent/50 bg-background/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
								Total Bounty
								<BitmapChevron className="h-3 w-3" />
							</span>
						</div>
						<p className="max-w-xl font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground">
							Two arenas, The prize pool is split across
							technical and non-technical tracks, so every style of operator can
							dominate.
						</p>
					</div>
				</motion.div>

				<motion.div
					className="mt-14 grid gap-6 sm:grid-cols-2"
					variants={gridVariants}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.25 }}
				>
					{breakdown.map((item) => (
						<motion.article
							key={item.title}
							variants={cardVariants}
							whileHover={{ y: -6 }}
							whileTap={{ scale: 0.98 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className={cn(
								"group relative overflow-hidden rounded-2xl border border-border/40 bg-background/80 p-8 transition-all duration-300 min-h-[260px]",
								"hover:border-accent/60 hover:bg-accent/5"
							)}
						>
							<div
								className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
								aria-hidden="true"
							/>
							<header className="relative z-10 flex items-start justify-between gap-4">
								<div>
									<span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
										Track
									</span>
									<h3 className="mt-2 font-[var(--font-bebas)] text-[clamp(1.8rem,4vw,2.8rem)] uppercase text-foreground group-hover:text-accent transition-colors">
										{item.title}
									</h3>
								</div>
								<span className="font-mono text-xs uppercase tracking-[0.3em] text-accent/90">
									{item.amount}
								</span>
							</header>
							<p className="relative z-10 mt-4 font-mono text-xs leading-relaxed text-muted-foreground">
								{item.summary}
							</p>
							<div className="absolute bottom-0 left-0 h-px w-16 bg-border/40 transition-all duration-300 group-hover:w-24 group-hover:bg-accent" />
							<div className="absolute top-0 right-0 h-12 w-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								<div className="absolute top-0 right-0 h-px w-full bg-accent" />
								<div className="absolute top-0 right-0 h-full w-px bg-accent" />
							</div>
						</motion.article>
					))}
				</motion.div>
			</div>
		</section>
	)
}