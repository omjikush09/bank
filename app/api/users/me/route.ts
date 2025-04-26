import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { getUserById } from "@/lib/db/utils";

export async function GET() {
  try {
    // Verify user authentication
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: user.id,
      accountNumber: user.accountNumber,
      email: user.email,
      role: user.role,
      balance: user.balance,
    });
    
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}