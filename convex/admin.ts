import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Admin authentication
export const verifyAdmin = query({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      throw new Error("Admin credentials not configured");
    }

    const isValid = args.username === adminUsername && args.password === adminPassword;
    return { isValid };
  },
});

// Get registration statistics
export const getRegistrationStats = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    
    // Total registrations
    const totalRegistrations = registrations.length;
    
    // Count unique teams
    const teamsMap = new Map<string, any[]>();
    const soloParticipants: any[] = [];
    
    registrations.forEach(reg => {
      if (reg.teamName) {
        if (!teamsMap.has(reg.teamName)) {
          teamsMap.set(reg.teamName, []);
        }
        teamsMap.get(reg.teamName)!.push(reg);
      } else {
        soloParticipants.push(reg);
      }
    });
    
    const totalTeams = teamsMap.size;
    const totalSoloParticipants = soloParticipants.length;
    
    // Get teams with members
    const teams = Array.from(teamsMap.entries()).map(([teamName, members]) => ({
      teamName,
      teamSize: members[0].teamSize,
      currentMembers: members.length,
      members: members.map(m => ({
        name: m.name,
        rollNumber: m.rollNumber,
        phone: m.phone,
        college: m.college,
        year: m.year,
        experience: m.experience,
        registeredAt: m.registeredAt,
      })),
    }));
    
    // Attendance stats
    const attendedCount = registrations.filter(r => r.attended).length;
    const notAttendedCount = totalRegistrations - attendedCount;
    
    // Year-wise breakdown
    const yearBreakdown = registrations.reduce((acc, reg) => {
      acc[reg.year] = (acc[reg.year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRegistrations,
      totalTeams,
      totalSoloParticipants,
      attendedCount,
      notAttendedCount,
      yearBreakdown,
      teams: teams.sort((a, b) => a.teamName.localeCompare(b.teamName)),
      soloParticipants: soloParticipants.map(m => ({
        name: m.name,
        rollNumber: m.rollNumber,
        phone: m.phone,
        college: m.college,
        year: m.year,
        experience: m.experience,
        registeredAt: m.registeredAt,
      })),
    };
  },
});

// Export registrations data (for download)
export const exportRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    return registrations.map(reg => ({
      name: reg.name,
      rollNumber: reg.rollNumber,
      phone: reg.phone,
      college: reg.college,
      year: reg.year,
      teamName: reg.teamName || "Solo",
      teamSize: reg.teamSize,
      experience: reg.experience,
      attended: reg.attended || false,
      registeredAt: new Date(reg.registeredAt).toISOString(),
    }));
  },
});
