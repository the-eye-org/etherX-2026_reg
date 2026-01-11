
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
      if (profile.profile.name) next.name = profile.profile.name

      if (profile.profile.email) {
        const rollMatch = profile.profile.email.match(/^(\d{2}[a-zA-Z]\d{3})@/)
        if (rollMatch) next.rollNumber = rollMatch[1]
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
    setSelectedTeam(availableTeamOptions[0]?.teamName ?? "")
  }, [mode, availableTeamOptions, selectedTeam])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: name === "teamSize" ? Number(value) : value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (!formData.name.trim() || !formData.phone.trim() || !formData.year || !formData.experience) {
      toast.error("Fill out all required fields")
      setIsSubmitting(false)
      return
    }

    if (!rollNumberPattern.test(formData.rollNumber.trim())) {
      toast.error("Use roll format: 23N256")
      setIsSubmitting(false)
      return
    }

    let teamNameToUse: string | undefined
    let teamSizeToUse = formData.teamSize

    if (mode === "create") {
      if (!formData.teamName.trim()) {
        toast.error("Team name is required")
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
        toast.error("Selected team is unavailable")
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden border border-border/60 bg-card p-0 gap-0">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-border/60 bg-card/95 backdrop-blur-sm px-6 pt-6 pb-4 space-y-4">
          <div className="space-y-1">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-tight">Register for EtherX 2026</h2>
            <p className="font-mono text-xs text-muted-foreground">
              One submission per teammate. PSG CSE only.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-md border border-border/60 bg-muted/10 p-1">
            <Button
              type="button"
              variant={mode === "create" ? "default" : "ghost"}
              size="sm"
              className="h-9 font-mono text-xs uppercase tracking-widest"
              onClick={() => setMode("create")}
            >
              Create
            </Button>
            <Button
              type="button"
              variant={mode === "join" ? "default" : "ghost"}
              size="sm"
              className="h-9 font-mono text-xs uppercase tracking-widest"
              onClick={() => setMode("join")}
            >
              Join
            </Button>
          </div>

          {/* Inline badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">CSE only</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">2–4 members</Badge>
            <div className="ml-auto flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <span>{availableTeamOptions.length} open</span>
              <span className="h-3 w-px bg-border" />
              <span>{openSlotCount} seats</span>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto overscroll-contain px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            {/* Personal info */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Full name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rollNumber" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Roll number *
                  </Label>
                  <Input
                    id="rollNumber"
                    name="rollNumber"
                    autoComplete="off"
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    pattern="^\d{2}[a-zA-Z]\d{3}$"
                    placeholder="23N256"
                    className="h-10 font-mono"
                  />
                  {formData.rollNumber && !rollNumberPattern.test(formData.rollNumber) && (
                    <p className="font-mono text-[10px] text-destructive">Format: 2 digits + 1 letter + 3 digits</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="WhatsApp number"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="college" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    College
                  </Label>
                  <Input
                    id="college"
                    name="college"
                    readOnly
                    value={formData.college}
                    className="h-10 bg-muted/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Year *
                  </Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))} required>
                    <SelectTrigger className="h-10">
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Experience *
                  </Label>
                  <Select value={formData.experience} onValueChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select level" />
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
            </div>

            {/* Divider */}
            <div className="border-t border-border/60" />

            {/* Team section */}
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Team details</p>
              
              {mode === "create" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="teamName" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Team name *
                    </Label>
                    <Input
                      id="teamName"
                      name="teamName"
                      required
                      value={formData.teamName}
                      onChange={handleChange}
                      placeholder="Short identifier"
                      className="h-10"
                    />
                    <p className="font-mono text-[10px] text-muted-foreground">Share exact name with joiners</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Team size *
                    </Label>
                    <Select
                      value={String(formData.teamSize)}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, teamSize: Number(value) || prev.teamSize }))}
                      required
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 members</SelectItem>
                        <SelectItem value="3">3 members</SelectItem>
                        <SelectItem value="4">4 members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Select team *
                  </Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={availableTeamOptions.length ? "Choose team" : "No open teams"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeamOptions.map((team) => (
                        <SelectItem key={team.teamName} value={team.teamName}>
                          <span className="font-mono">{team.teamName}</span>
                          <span className="ml-2 text-muted-foreground">({team.memberCount}/{team.teamSize})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!availableTeamOptions.length && (
                    <p className="font-mono text-[10px] text-muted-foreground">No teams available. Create one instead.</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="h-10 font-mono text-xs uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 min-w-[140px] font-mono text-xs uppercase tracking-widest"
              >
                {isSubmitting ? "Submitting..." : mode === "create" ? "Create team" : "Join team"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
