import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { query } from "./_generated/server";

// PSG College email pattern: rollnumber@psgtech.ac.in
const PSG_EMAIL_DOMAIN = "psgtech.ac.in";
const ROLL_NUMBER_PATTERN = /^(\d{2}[a-zA-Z]\d{3})@psgtech\.ac\.in$/i;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const currentUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get user from auth tables
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const email = user.email || "";
    const rollMatch = email.match(ROLL_NUMBER_PATTERN);
    const rollNumber = rollMatch ? rollMatch[1].toUpperCase() : null;
    const isValidPSGEmail = email.toLowerCase().endsWith(`@${PSG_EMAIL_DOMAIN}`);

    // Return user information with profile data and eligibility
    return {
      ...user,
      profile: {
        name: user.name,
        email: user.email,
        image: (user as unknown as { image?: string }).image,
        rollNumber,
        isEligible: isValidPSGEmail && rollNumber !== null,
        isValidPSGEmail,
      },
    };
  },
});

// Query to check if user is eligible to register (has valid PSG email)
export const checkEligibility = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isLoggedIn: false, isEligible: false, reason: "Not logged in" };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { isLoggedIn: true, isEligible: false, reason: "User not found" };
    }

    const email = user.email || "";
    const isValidPSGEmail = email.toLowerCase().endsWith(`@${PSG_EMAIL_DOMAIN}`);
    const rollMatch = email.match(ROLL_NUMBER_PATTERN);
    const rollNumber = rollMatch ? rollMatch[1].toUpperCase() : null;

    if (!isValidPSGEmail) {
      return {
        isLoggedIn: true,
        isEligible: false,
        reason: "Please use your PSG Tech email (@psgtech.ac.in)",
        email,
      };
    }

    if (!rollNumber) {
      return {
        isLoggedIn: true,
        isEligible: false,
        reason: "Email format should be rollnumber@psgtech.ac.in",
        email,
      };
    }

    return {
      isLoggedIn: true,
      isEligible: true,
      rollNumber,
      name: user.name,
      email,
    };
  },
});
