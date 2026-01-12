import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// PSG College email pattern
const PSG_EMAIL_DOMAIN = "psgtech.ac.in";
const ROLL_NUMBER_PATTERN = /^(\d{2}[a-zA-Z]\d{3})@psgtech\.ac\.in$/i;

export const register = mutation({
  args: {
    name: v.string(),
    rollNumber: v.string(),
    phone: v.string(),
    college: v.string(),
    year: v.string(),
    teamName: v.optional(v.string()),
    teamSize: v.number(),
    experience: v.string(),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be logged in to register");
    }

    // Get user to validate eligibility
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const email = user.email || "";
    const isValidPSGEmail = email.toLowerCase().endsWith(`@${PSG_EMAIL_DOMAIN}`);
    
    if (!isValidPSGEmail) {
      throw new Error("Only PSG Tech students (@psgtech.ac.in) can register");
    }

    const rollMatch = email.match(ROLL_NUMBER_PATTERN);
    const extractedRollNumber = rollMatch ? rollMatch[1].toUpperCase() : null;
    
    if (!extractedRollNumber) {
      throw new Error("Invalid PSG email format. Email should be rollnumber@psgtech.ac.in");
    }

    // Validate that the submitted roll number matches the email
    if (args.rollNumber.toUpperCase() !== extractedRollNumber) {
      throw new Error(`Roll number must match your email (${extractedRollNumber})`);
    }

    // Check if roll number already registered
    const existingRoll = await ctx.db
      .query("registrations")
      .withIndex("by_roll_number", (q) => q.eq("rollNumber", args.rollNumber.toUpperCase()))
      .first();
    
    if (existingRoll) {
      throw new Error("Roll number already registered");
    }

    // Check if phone number already registered
    const existingPhone = await ctx.db
      .query("registrations")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
    
    if (existingPhone) {
      throw new Error("Phone number already registered");
    }

    // Check if team name already exists (if provided and we're creating a team)
    if (args.teamName) {
      const existingTeamMembers = await ctx.db
        .query("registrations")
        .withIndex("by_team_name", (q) => q.eq("teamName", args.teamName))
        .collect();
      
      if (existingTeamMembers.length > 0) {
        // If team exists, check if it's full
        const teamSize = existingTeamMembers[0].teamSize;
        if (existingTeamMembers.length >= teamSize) {
          throw new Error("Team is already full");
        }
      }
    }

    const registrationId = await ctx.db.insert("registrations", {
      ...args,
      rollNumber: args.rollNumber.toUpperCase(),
      userId,
      registeredAt: Date.now(),
      attended: false,
    });

    return registrationId;
  },
});

export const getRegistrations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("registrations").collect();
  },
});

export const getRegistrationCount = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    return registrations.length;
  },
});

export const updateAttendance = mutation({
  args: {
    id: v.id("registrations"),
    attended: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { attended: args.attended ?? false });
  },
});

export const getTeams = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    const teamsMap = new Map<string, { teamName: string; memberCount: number; teamSize: number }>();

    registrations.forEach(reg => {
      if (reg.teamName) {
        const existing = teamsMap.get(reg.teamName);
        if (existing) {
          existing.memberCount += 1;
        } else {
          teamsMap.set(reg.teamName, {
            teamName: reg.teamName,
            memberCount: 1,
            teamSize: reg.teamSize,
          });
        }
      }
    });

    return Array.from(teamsMap.values()).filter(team => team.memberCount < team.teamSize);
  },
});
