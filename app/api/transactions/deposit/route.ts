import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getUserByAccountNumber, depositToAccount } from "@/lib/db/utils";

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
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
    
    // Parse request body
    const body = await request.json();
    const { accountNumber, amount } = body;
    
    // Validate required fields
    if (!accountNumber) {
      return NextResponse.json(
        { message: "Account number is required" },
        { status: 400 }
      );
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Amount must be greater than 0" },
        { status: 400 }
      );
    }
    
    // Validate account number format
    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { message: "Invalid account number format" },
        { status: 400 }
      );
    }
    
    // Check if account exists
    const targetUser = await getUserByAccountNumber(accountNumber);
    
    if (!targetUser) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }
    
    // Process deposit
    const { newBalance } = await depositToAccount(accountNumber, amount);
    
    // Return success response
    return NextResponse.json({
      message: "Deposit completed successfully",
      newBalance: newBalance,
    });
    
  } catch (error) {
    console.error("Error in /api/transactions/deposit:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}