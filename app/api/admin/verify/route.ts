import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextRequest, NextResponse } from "next/server";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { isValid: false, error: "Username and password required" },
        { status: 400 }
      );
    }

    const result = await client.query(api.admin.verifyAdmin, {
      username,
      password,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { isValid: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
