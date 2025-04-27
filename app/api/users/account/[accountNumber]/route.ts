import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getUserByAccountNumber } from "@/lib/db/utils";

export async function GET(
  request: Request,
  { params }: { params: { accountNumber: string } }
) {
  try {
    // Verify user authentication
    const {userId,orgRole}=await auth();
    const user = await currentUser();
    
    if (!userId ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const userMetadata = user?.publicMetadata as { role?: string };
    const isAdmin = userMetadata?.role === "admin";
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
    
    // Get account number from URL parameters
    const { accountNumber } = params;
    
    // Validate account number format
    if (!accountNumber || !/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { message: "Invalid account number format" },
        { status: 400 }
      );
    }
    
    // Get user from database
    const dbUser = await getUserByAccountNumber(accountNumber);
    
    if (!dbUser) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }
    
    // Return limited user data
    return NextResponse.json({
      email: dbUser.email,
      balance: dbUser.balance,
    });
    
  } catch (error) {
    console.error("Error in /api/users/account/[accountNumber]:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}