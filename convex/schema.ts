import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  registrations: defineTable({ 
    name: v.string(),
    rollNumber: v.optional(v.string()),
    phone: v.string(),
    college: v.string(),
    year: v.string(),
    teamName: v.optional(v.string()),
    teamSize: v.number(),
    experience: v.string(),
    userId: v.optional(v.id("users")),
    registeredAt: v.number(),
    attended: v.optional(v.boolean()),
  })
    .index("by_roll_number", ["rollNumber"])
    .index("by_phone", ["phone"])
    .index("by_team_name", ["teamName"])
    .index("by_user_id", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
