
"use client"

import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type RegistrationMode = "create" | "join"

type FormState = {
  name: string
  rollNumber: string
  phone: string
  college: string
  year: string
  teamName: string
  teamSize: number
  experience: string
}

const initialForm: FormState = {
  name: "",
  rollNumber: "",
  phone: "",
  college: "PSG College of Technology",
  year: "",
  teamName: "",
  teamSize: 2,
  experience: "beginner",
}

const rollNumberPattern = /^\d{2}[a-zA-Z]\d{3}$/

export function RegistrationDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<RegistrationMode>("create")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormState>(initialForm)

  const profile = useQuery(api.auth.currentUserProfile)
  const availableTeams = useQuery(api.registrations.getTeams)
  const register = useMutation(api.registrations.register)

  useEffect(() => {
    if (!profile?.profile) return

    setFormData((prev) => {
      const next = { ...prev }

      if (profile.profile.name) {
        next.name = profile.profile.name
      }

      if (profile.profile.email) {
        const rollMatch = profile.profile.email.match(/^(\d{2}[a-zA-Z]\d{3})@/)
        if (rollMatch) {
          next.rollNumber = rollMatch[1]
        }
      }

      return next
    })
  }, [profile])

  const availableTeamOptions = useMemo(() => availableTeams ?? [], [availableTeams])
  const openSlotCount = useMemo(
    () =>
      availableTeamOptions.reduce(
        (open, team) => open + Math.max((team.teamSize ?? 0) - (team.memberCount ?? 0), 0),
        0,
      ),
    [availableTeamOptions],
  )

  useEffect(() => {
    if (mode !== "join") return
    if (selectedTeam && availableTeamOptions.some((team) => team.teamName === selectedTeam)) return

    if (availableTeamOptions.length > 0) {
      setSelectedTeam(availableTeamOptions[0].teamName)
    } else {
      setSelectedTeam("")
    }
  }, [mode, availableTeamOptions, selectedTeam])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "teamSize" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (!formData.name.trim() || !formData.phone.trim() || !formData.year || !formData.experience) {
      toast.error("Fill out all required fields before submitting")
      setIsSubmitting(false)
      return
    }

    if (!rollNumberPattern.test(formData.rollNumber.trim())) {
      toast.error("Use roll format: 23N256 (2 digits + 1 letter + 3 digits)")
      setIsSubmitting(false)
      return
    }

    let teamNameToUse: string | undefined
    let teamSizeToUse = formData.teamSize

    if (mode === "create") {
      if (!formData.teamName.trim()) {
        toast.error("Team name is required when creating a team")
        setIsSubmitting(false)
        return
      }
      teamNameToUse = formData.teamName.trim()
    } else {
      if (!selectedTeam) {
        toast.error("Pick a team to join")
        setIsSubmitting(false)
        return
      }
      const team = availableTeamOptions.find((option) => option.teamName === selectedTeam)
      if (!team) {
        toast.error("Selected team is no longer available")
        setIsSubmitting(false)
        return
      }
      teamNameToUse = team.teamName
      teamSizeToUse = team.teamSize
    }

    try {
      await register({
        ...formData,
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        teamName: teamNameToUse,
        teamSize: teamSizeToUse,
      })
      toast.success("Registration submitted")
      setFormData(initialForm)
      setSelectedTeam("")
      setMode("create")
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl bg-card/95 backdrop-blur">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="font-[var(--font-bebas)] text-3xl tracking-tight">EtherX 2026 Registration</DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground leading-relaxed">
            Secure your spot for the multi-stage build + CTF sprint. Borrowing the clarity from our last Cyber Chxse run:
            keep names concise, verify contact numbers, and lock a single submission per teammate. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.95fr] items-start">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className={cn("rounded-full border px-3 py-1", mode === "create" && "border-accent text-accent")}>Create team</span>
              <span className={cn("rounded-full border px-3 py-1", mode === "join" && "border-accent text-accent")}>Join team</span>
            </div>

            <div className="flex gap-2 rounded-md border border-border/60 p-2 text-sm font-mono uppercase tracking-[0.2em]">
              <Button type="button" variant={mode === "create" ? "default" : "ghost"} className="flex-1" onClick={() => setMode("create")}>
                Create team
              </Button>
              <Button type="button" variant={mode === "join" ? "default" : "ghost"} className="flex-1" onClick={() => setMode("join")}
              >
                Join existing
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
                {profile?.profile?.name && <p className="font-mono text-[10px] text-muted-foreground">Pulled from your profile</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll number *</Label>
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  autoComplete="off"
                  required
                  value={formData.rollNumber}
                  onChange={handleChange}
                  pattern="^\\d{2}[a-zA-Z]\\d{3}$"
                  title="Format: 23N256 (2 digits + 1 letter + 3 digits)"
                  placeholder="23N256"
                />
                <p className="font-mono text-[10px] text-muted-foreground">College alias: {formData.rollNumber || "xxNxxx"}@psgtech.ac.in</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="WhatsApp-friendly number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input id="college" name="college" readOnly value={formData.college} onChange={handleChange} />
                <p className="font-mono text-[10px] text-muted-foreground">Locked to PSG CSE cohorts</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Academic year *</Label>
                <Select value={formData.year} onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))} required>
                  <SelectTrigger className="w-full justify-between">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st year</SelectItem>
                    <SelectItem value="2nd">2nd year</SelectItem>
                    <SelectItem value="3rd">3rd year</SelectItem>
                    <SelectItem value="4th">4th year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience *</Label>
                <Select value={formData.experience} onValueChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))} required>
                  <SelectTrigger className="w-full justify-between">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mode === "create" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team name *</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    required
                    value={formData.teamName}
                    onChange={handleChange}
                    placeholder="Team identifier"
                  />
                  <p className="font-mono text-[10px] text-muted-foreground">Share this exact name with joiners</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team size *</Label>
                  <Select
                    value={String(formData.teamSize)}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, teamSize: Number(value) || prev.teamSize }))}
                    required
                  >
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Team of 2</SelectItem>
                      <SelectItem value="3">Team of 3</SelectItem>
                      <SelectItem value="4">Team of 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select team to join *</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam} required>
                  <SelectTrigger className="w-full justify-between">
                    <SelectValue placeholder={availableTeamOptions.length ? "Choose a team" : "No open teams"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeamOptions.map((team) => (
                      <SelectItem key={team.teamName} value={team.teamName}>
                        {team.teamName} ({team.memberCount}/{team.teamSize})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!availableTeamOptions.length && <p className="text-sm text-muted-foreground">No teams with open slots. Create a team instead.</p>}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
                {isSubmitting ? "Submitting..." : mode === "create" ? "Create team" : "Join team"}
              </Button>
            </div>
          </form>

          <aside className="space-y-4 rounded-lg border border-border/60 bg-muted/5 p-4 lg:sticky lg:top-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">CSE Dept only</Badge>
              <Badge variant="secondary">Teams of 2–4</Badge>
              <Badge variant="outline">Use PSG email</Badge>
            </div>

            <p className="font-mono text-xs text-muted-foreground">
              Lifted from last year’s Cyber Chxse checklist: short team names, verified phone numbers, and single submissions per teammate keep the queue clean.
            </p>

            <div className="rounded-md border border-border/50 bg-background/40 p-3">
              <p className="text-sm font-semibold text-foreground">Live availability</p>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-muted-foreground">
                <span className="flex items-center justify-between">
                  <span>Open teams</span>
                  <span className="text-foreground">{availableTeamOptions.length}</span>
                </span>
                <span className="flex items-center justify-between">
                  <span>Open seats</span>
                  <span className="text-foreground">{openSlotCount}</span>
                </span>
              </div>
              {mode === "join" && !availableTeamOptions.length && <p className="mt-2 font-mono text-[10px] text-muted-foreground">No open teams right now.</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Mode tips</p>
              <ul className="space-y-1 font-mono text-xs text-muted-foreground">
                {mode === "create" ? (
                  <>
                    <li>Lock the headcount now; it cannot exceed 4.</li>
                    <li>Share the exact team name so joiners find you.</li>
                    <li>Keep a reachable WhatsApp contact tied to the phone provided.</li>
                  </>
                ) : (
                  <>
                    <li>Pick a team with enough remaining seats for everyone.</li>
                    <li>Sync with captains before you submit to avoid duplicates.</li>
                    <li>We mirror email formatting from the old portal for consistency.</li>
                  </>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
