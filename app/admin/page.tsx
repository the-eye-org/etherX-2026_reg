"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attemptLogin, setAttemptLogin] = useState(false);

  const verifyResult = useQuery(
    api.admin.verifyAdmin,
    attemptLogin ? { username, password } : "skip"
  );

  const stats = useQuery(
    api.admin.getRegistrationStats,
    isAuthenticated ? {} : "skip"
  );

  // Handle verification result
  if (attemptLogin && verifyResult !== undefined) {
    setAttemptLogin(false);
    if (verifyResult.isValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      setError("");
    } else {
      setError("Invalid username or password");
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAttemptLogin(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setUsername("");
    setPassword("");
  };

  const downloadCSV = () => {
    if (!stats) return;

    const headers = ["Name", "Roll Number", "Phone", "College", "Year", "Team Name", "Team Size", "Experience", "Registered At"];
    const rows: string[][] = [];

    // Add team members
    stats.teams.forEach(team => {
      team.members.forEach(member => {
        rows.push([
          member.name,
          member.rollNumber || "",
          member.phone,
          member.college,
          member.year,
          team.teamName,
          team.teamSize.toString(),
          member.experience,
          new Date(member.registeredAt).toLocaleString(),
        ]);
      });
    });

    // Add solo participants
    stats.soloParticipants.forEach(member => {
      rows.push([
        member.name,
        member.rollNumber || "",
        member.phone,
        member.college,
        member.year,
        "Solo",
        "1",
        member.experience,
        new Date(member.registeredAt).toLocaleString(),
      ]);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Check session storage on mount
  useState(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
        <Card className="w-full max-w-md relative z-10 border-border/60 bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-[var(--font-bebas)] tracking-tight">Admin Access</CardTitle>
            <CardDescription className="font-mono text-xs">
              Enter credentials to view registration dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-10 bg-input border-border/60 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 bg-input border-border/60 font-mono text-sm"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-mono">{error}</p>
              )}
              <Button type="submit" className="w-full h-10 font-mono text-xs uppercase tracking-widest" disabled={attemptLogin}>
                {attemptLogin ? "Verifying..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 relative">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border/60 pb-6">
          <div>
            <h1 className="text-4xl font-[var(--font-bebas)] tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-wider">Registration Statistics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadCSV} variant="outline" className="font-mono text-xs uppercase tracking-wider border-border/60">
              Export CSV
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="font-mono text-xs uppercase tracking-wider">
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-[var(--font-bebas)] text-foreground">{stats?.totalRegistrations || 0}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                All participants
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Total Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-[var(--font-bebas)] text-foreground">{stats?.totalTeams || 0}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Registered teams
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Solo Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-[var(--font-bebas)] text-foreground">{stats?.totalSoloParticipants || 0}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Individual registrations
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-[var(--font-bebas)] text-foreground">{stats?.attendedCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {stats?.notAttendedCount || 0} not attended
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Year-wise Breakdown */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider text-foreground">Year-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {stats && Object.entries(stats.yearBreakdown).map(([year, count]) => (
                <div key={year} className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono bg-accent/20 text-accent border-accent/30">{year}</Badge>
                  <span className="text-sm font-mono text-muted-foreground">{count} students</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teams and Solo Participants */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/20 border border-border/60">
            <TabsTrigger value="teams" className="font-mono text-xs uppercase tracking-wider">Teams ({stats?.totalTeams || 0})</TabsTrigger>
            <TabsTrigger value="solo" className="font-mono text-xs uppercase tracking-wider">Solo ({stats?.totalSoloParticipants || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            {stats?.teams.map((team) => (
              <Card key={team.teamName} className="border-border/60 bg-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-[var(--font-bebas)] text-xl tracking-tight">{team.teamName}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {team.currentMembers} / {team.teamSize} members
                      </CardDescription>
                    </div>
                    <Badge variant={team.currentMembers === team.teamSize ? "default" : "secondary"} className="font-mono text-xs">
                      {team.currentMembers === team.teamSize ? "Full" : "Incomplete"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60">
                        <TableHead className="font-mono text-xs uppercase tracking-wider">Name</TableHead>
                        <TableHead className="font-mono text-xs uppercase tracking-wider">Roll Number</TableHead>
                        <TableHead className="font-mono text-xs uppercase tracking-wider">Phone</TableHead>
                        <TableHead className="font-mono text-xs uppercase tracking-wider">College</TableHead>
                        <TableHead className="font-mono text-xs uppercase tracking-wider">Year</TableHead>
                        <TableHead className="font-mono text-xs uppercase tracking-wider">Experience</TableHead>
                        <TableHead className="font-mono text-xs uppercase tracking-wider">Registered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.members.map((member, idx) => (
                        <TableRow key={idx} className="border-border/60">
                          <TableCell className="font-mono text-sm">{member.name}</TableCell>
                          <TableCell className="font-mono text-sm">{member.rollNumber}</TableCell>
                          <TableCell className="font-mono text-sm">{member.phone}</TableCell>
                          <TableCell className="font-mono text-sm">{member.college}</TableCell>
                          <TableCell className="font-mono text-sm capitalize">{member.year}</TableCell>
                          <TableCell className="font-mono text-sm capitalize">{member.experience}</TableCell>
                          <TableCell className="font-mono text-sm">{new Date(member.registeredAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="solo" className="space-y-4">
            <Card className="border-border/60 bg-card">
              <CardHeader>
                <CardTitle className="font-[var(--font-bebas)] text-xl tracking-tight">Solo Participants</CardTitle>
                <CardDescription className="font-mono text-xs">Individual registrations without teams</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60">
                      <TableHead className="font-mono text-xs uppercase tracking-wider">Name</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider">Roll Number</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider">Phone</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider">College</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider">Year</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider">Experience</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider">Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.soloParticipants.map((member, idx) => (
                      <TableRow key={idx} className="border-border/60">
                        <TableCell className="font-mono text-sm">{member.name}</TableCell>
                        <TableCell className="font-mono text-sm">{member.rollNumber}</TableCell>
                        <TableCell className="font-mono text-sm">{member.phone}</TableCell>
                        <TableCell className="font-mono text-sm">{member.college}</TableCell>
                        <TableCell className="font-mono text-sm capitalize">{member.year}</TableCell>
                        <TableCell className="font-mono text-sm capitalize">{member.experience}</TableCell>
                        <TableCell className="font-mono text-sm">{new Date(member.registeredAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
