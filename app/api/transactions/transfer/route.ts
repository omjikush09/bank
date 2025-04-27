import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getUserById, getUserByAccountNumber, transferBetweenAccounts } from "@/lib/db/utils";

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const { userId } = await auth();
     
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
    
    // Parse request body
    const body = await request.json();
    const { toAccount, amount } = body;
    
    // Validate required fields
    if (!toAccount) {
      return NextResponse.json(
        { message: "Destination account is required" },
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
    if (!/^\d{10}$/.test(toAccount)) {
      return NextResponse.json(
        { message: "Invalid account number format" },
        { status: 400 }
      );
    }
    
    // Check if destination account exists
    const destinationUser = await getUserByAccountNumber(toAccount);
    
    if (!destinationUser) {
      return NextResponse.json(
        { message: "Destination account not found" },
        { status: 404 }
      );
    }
    
    // Prevent transfers to self
    if (user.accountNumber === toAccount) {
      return NextResponse.json(
        { message: "Cannot transfer to your own account" },
        { status: 400 }
      );
    }
    
    // Check if user has sufficient balance
    if (parseFloat(user.balance.toString()) < amount) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
    }
    
    // Process transfer
    const { sourceBalance } = await transferBetweenAccounts(
      user.accountNumber,
      toAccount,
      amount
    );
    
    // Return success response
    return NextResponse.json({
      message: "Transfer completed successfully",
      newBalance: sourceBalance,
    });
    
  } catch (error) {
    console.error("Error in /api/transactions/transfer:", error);
    
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