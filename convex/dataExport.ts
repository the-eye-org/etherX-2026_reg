import { query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Query to get all registrations with team information
export const getAllRegistrationsWithTeams = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const registrations = await ctx.db.query("registrations").collect();

    // Group by teams and add team statistics
    const teamsMap = new Map();

    // First pass: collect all team information
    registrations.forEach(reg => {
      if (reg.teamName) {
        if (!teamsMap.has(reg.teamName)) {
          teamsMap.set(reg.teamName, {
            teamName: reg.teamName,
            teamSize: reg.teamSize,
            members: [],
            registeredAt: reg.registeredAt,
            experienceLevels: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
            years: { "1st": 0, "2nd": 0, "3rd": 0, "4th": 0 }
          });
        }

        const team = teamsMap.get(reg.teamName);
        team.members.push({
          name: reg.name,
          rollNumber: reg.rollNumber,
          phone: reg.phone,
          year: reg.year,
          experience: reg.experience,
          registeredAt: reg.registeredAt
        });

        // Count experience levels
        team.experienceLevels[reg.experience] = (team.experienceLevels[reg.experience] || 0) + 1;

        // Count years
        team.years[reg.year] = (team.years[reg.year] || 0) + 1;
      }
    });

    return {
      summary: {
        totalRegistrations: registrations.length,
        totalTeams: teamsMap.size,
        individualParticipants: registrations.filter(r => !r.teamName).length,
        teamParticipants: registrations.filter(r => r.teamName).length
      },
      teams: Array.from(teamsMap.values()),
      individualRegistrations: registrations.filter(r => !r.teamName),
      allRegistrations: registrations
    };
  },
});

// Export data in CSV format
export const exportToCSV = query({
  args: {},
  handler: async (ctx): Promise<string> => {
    const data = await ctx.runQuery(api.dataExport.getAllRegistrationsWithTeams);

    // CSV headers
    const headers = [
      "Name",
      "Roll Number",
      "Phone",
      "College",
      "Year",
      "Team Name",
      "Team Size",
      "Experience",
      "Registration Date",
      "Email"
    ];

    // Convert registrations to CSV rows
    const rows: string[][] = data.allRegistrations.map((reg: any) => [
      reg.name,
      reg.rollNumber || "",
      reg.phone,
      reg.college,
      reg.year,
      reg.teamName || "Individual",
      reg.teamName ? reg.teamSize.toString() : "1",
      reg.experience,
      new Date(reg.registeredAt).toISOString(),
      reg.rollNumber ? `${reg.rollNumber}@psgtech.ac.in` : ""
    ]);

    // Combine headers and rows
    const csvContent: string = [headers, ...rows]
      .map((row: string[]) => row.map((field: string) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  },
});

// Export team summary in JSON format
export const exportTeamsJSON = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const data = await ctx.runQuery(api.dataExport.getAllRegistrationsWithTeams);

    const teamsData = data.teams.map((team: any) => ({
      teamName: team.teamName,
      teamSize: team.teamSize,
      currentMembers: team.members.length,
      isComplete: team.members.length === team.teamSize,
      members: team.members.map((member: any) => ({
        name: member.name,
        rollNumber: member.rollNumber,
        year: member.year,
        experience: member.experience,
        email: member.rollNumber ? `${member.rollNumber}@psgtech.ac.in` : null,
        phone: member.phone
      })),
      statistics: {
        experienceBreakdown: team.experienceLevels,
        yearBreakdown: team.years,
        registrationDate: new Date(team.registeredAt).toISOString()
      }
    }));

    return {
      exportDate: new Date().toISOString(),
      summary: data.summary,
      teams: teamsData
    };
  },
});

// Export for Excel format (tab-separated values)
export const exportToExcel = query({
  args: {},
  handler: async (ctx): Promise<string> => {
    const data = await ctx.runQuery(api.dataExport.getAllRegistrationsWithTeams);

    // Excel-friendly format with tabs
    const headers = [
      "Name",
      "Roll Number",
      "Phone",
      "College",
      "Year",
      "Team Name",
      "Team Size",
      "Experience",
      "Registration Date",
      "Email",
      "Team Status"
    ];

    const rows: string[][] = data.allRegistrations.map((reg: any) => {
      const teamMembers = reg.teamName ?
        data.teams.find((t: any) => t.teamName === reg.teamName)?.members.length || 0 : 0;
      const teamSize = reg.teamName ?
        data.teams.find((t: any) => t.teamName === reg.teamName)?.teamSize || 0 : 0;

      return [
        reg.name,
        reg.rollNumber || "",
        reg.phone,
        reg.college,
        reg.year,
        reg.teamName || "Individual",
        reg.teamName ? teamSize.toString() : "1",
        reg.experience,
        new Date(reg.registeredAt).toLocaleDateString(),
        reg.rollNumber ? `${reg.rollNumber}@psgtech.ac.in` : "",
        reg.teamName ? `${teamMembers}/${teamSize} members` : "Individual"
      ];
    });

    // Combine with tabs for Excel compatibility
    const excelContent: string = [headers, ...rows]
      .map((row: string[]) => row.join("\t"))
      .join("\n");

    return excelContent;
  },
});

// Export individual participants only
export const exportIndividualsOnly = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const data = await ctx.runQuery(api.dataExport.getAllRegistrationsWithTeams);

    return {
      exportDate: new Date().toISOString(),
      count: data.individualRegistrations.length,
      individuals: data.individualRegistrations.map((reg: any) => ({
        name: reg.name,
        rollNumber: reg.rollNumber,
        phone: reg.phone,
        college: reg.college,
        year: reg.year,
        experience: reg.experience,
        email: reg.rollNumber ? `${reg.rollNumber}@psgtech.ac.in` : null,
        registrationDate: new Date(reg.registeredAt).toISOString()
      }))
    };
  },
});

// Export team contact information
export const exportTeamContacts = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const data = await ctx.runQuery(api.dataExport.getAllRegistrationsWithTeams);

    return {
      exportDate: new Date().toISOString(),
      teams: data.teams.map((team: any) => ({
        teamName: team.teamName,
        teamSize: team.teamSize,
        memberCount: team.members.length,
        contacts: team.members.map((member: any) => ({
          name: member.name,
          email: member.rollNumber ? `${member.rollNumber}@psgtech.ac.in` : null,
          phone: member.phone,
          year: member.year
        })),
        teamEmail: team.members.length > 0 && team.members[0].rollNumber
          ? `${team.members[0].rollNumber}@psgtech.ac.in`
          : null
      }))
    };
  },
});