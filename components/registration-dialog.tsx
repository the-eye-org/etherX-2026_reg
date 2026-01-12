"use client"

import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
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
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [formData, setFormData] = useState<FormState>(initialForm)

  const { signIn, signOut } = useAuthActions()
  const profile = useQuery(api.auth.currentUserProfile)
  const eligibility = useQuery(api.auth.checkEligibility)
  const availableTeams = useQuery(api.registrations.getTeams)
  const register = useMutation(api.registrations.register)

  const isLoggedIn = eligibility?.isLoggedIn ?? false
  const isEligible = eligibility?.isEligible ?? false

  // Auto-populate form with user data when logged in
  useEffect(() => {
    if (!profile?.profile) return

    setFormData((prev) => {
      const next = { ...prev }
      if (profile.profile.name) next.name = profile.profile.name
      if (profile.profile.rollNumber) next.rollNumber = profile.profile.rollNumber

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

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true)
    try {
      await signIn("google", { redirectTo: window.location.href })
    } catch (error) {
      toast.error("Failed to sign in with Google")
      setIsLoggingIn(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setFormData(initialForm)
    toast.success("Signed out successfully")
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (!isLoggedIn) {
      toast.error("Please sign in with Google first")
      setIsSubmitting(false)
      return
    }

    if (!isEligible) {
      toast.error(eligibility?.reason || "You are not eligible to register")
      setIsSubmitting(false)
      return
    }

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
      toast.success("Registration submitted successfully!")
      setFormData(initialForm)
      setSelectedTeam("")
      setMode("create")
      setOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      
      if (errorMessage.includes("Roll number already registered")) {
        toast.error(`Roll number ${formData.rollNumber.toUpperCase()} is already registered.`)
      } else if (errorMessage.includes("Phone number already registered")) {
        toast.error("This phone number is already registered.")
      } else if (errorMessage.includes("must match your email")) {
        toast.error(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-2xl h-[95vh] sm:h-auto max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-border/60 bg-card p-0 gap-0 rounded-none sm:rounded-lg flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-border/60 bg-card/95 backdrop-blur-sm px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
          <div className="space-y-1">
            <h2 className="font-[var(--font-bebas)] text-2xl sm:text-3xl tracking-tight">Register for EtherX 2026</h2>
            <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">
              Sign in with your PSG Tech Google account to register.
            </p>
          </div>

          {/* Auth Status */}
          {isLoggedIn ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-accent/30 bg-accent/5">
              <div className="flex items-center gap-3 min-w-0">
                {profile?.profile?.image && (
                  <img 
                    src={profile.profile.image} 
                    alt="" 
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-mono text-xs text-foreground truncate">{profile?.profile?.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{profile?.profile?.email}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full h-10 sm:h-11 font-mono text-xs uppercase tracking-widest gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoggingIn ? "Signing in..." : "Sign in with Google"}
            </Button>
          )}

          {/* Eligibility Warning */}
          {isLoggedIn && !isEligible && (
            <div className="p-3 rounded-md border border-destructive/30 bg-destructive/5">
              <p className="font-mono text-[10px] sm:text-xs text-destructive">
                ⚠️ {eligibility?.reason || "You are not eligible to register"}
              </p>
              <p className="font-mono text-[9px] text-muted-foreground mt-1">
                Please sign in with your PSG Tech email (rollnumber@psgtech.ac.in)
              </p>
            </div>
          )}

          {/* Only show mode toggle and badges if eligible */}
          {isLoggedIn && isEligible && (
            <>
              {/* Mode toggle */}
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border/60 bg-muted/10 p-1">
                <Button
                  type="button"
                  variant={mode === "create" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 sm:h-9 font-mono text-[10px] sm:text-xs uppercase tracking-widest"
                  onClick={() => setMode("create")}
                >
                  Create
                </Button>
                <Button
                  type="button"
                  variant={mode === "join" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 sm:h-9 font-mono text-[10px] sm:text-xs uppercase tracking-widest"
                  onClick={() => setMode("join")}
                >
                  Join
                </Button>
              </div>

              {/* Inline badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-[9px] sm:text-[10px]">PSG CSE, Msc, ECE and IT</Badge>
                <Badge variant="secondary" className="font-mono text-[9px] sm:text-[10px]">2–4 members</Badge>
                <div className="ml-auto flex items-center gap-2 font-mono text-[9px] sm:text-[10px] text-muted-foreground">
                  <span>{availableTeamOptions.length} open</span>
                  <span className="h-3 w-px bg-border" />
                  <span>{openSlotCount} seats</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Scrollable body - only show form if logged in and eligible */}
        {isLoggedIn && isEligible ? (
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-4">
              {/* Personal info */}
              <div className="space-y-3 sm:space-y-4">
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="name" className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
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
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="rollNumber" className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Roll number *
                    </Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      autoComplete="off"
                      required
                      readOnly
                      value={formData.rollNumber}
                      className="h-9 sm:h-10 font-mono text-sm bg-muted/30"
                    />
                    <p className="font-mono text-[9px] text-muted-foreground">Auto-filled from your email</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="phone" className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
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
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="college" className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      College
                    </Label>
                    <Input
                      id="college"
                      name="college"
                      readOnly
                      value={formData.college}
                      className="h-9 sm:h-10 bg-muted/30 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Year *
                    </Label>
                    <Select value={formData.year} onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))} required>
                      <SelectTrigger className="h-9 sm:h-10 text-sm">
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
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Experience *
                    </Label>
                    <Select value={formData.experience} onValueChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))} required>
                      <SelectTrigger className="h-9 sm:h-10 text-sm">
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
              <div className="space-y-3 sm:space-y-4">
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">Team details</p>
                
                {mode === "create" ? (
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="teamName" className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Team name *
                      </Label>
                      <Input
                        id="teamName"
                        name="teamName"
                        required
                        value={formData.teamName}
                        onChange={handleChange}
                        placeholder="Short identifier"
                        className="h-9 sm:h-10 text-sm"
                      />
                      <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">Share exact name with joiners</p>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Team size *
                      </Label>
                      <Select
                        value={String(formData.teamSize)}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, teamSize: Number(value) || prev.teamSize }))}
                        required
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
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
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Select team *
                    </Label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam} required>
                      <SelectTrigger className="h-9 sm:h-10 text-sm">
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
                      <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">No teams available. Create one instead.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 sm:gap-3 pt-2 sm:pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="h-9 sm:h-10 font-mono text-xs uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 sm:h-10 min-w-[120px] sm:min-w-[140px] font-mono text-xs uppercase tracking-widest"
                >
                  {isSubmitting ? "Submitting..." : mode === "create" ? "Create team" : "Join team"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-border/60 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-sm text-foreground">Sign in to continue</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  Use your PSG Tech Google account<br />
                  (rollnumber@psgtech.ac.in)
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
