import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createUser } from "@/lib/db/utils";

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
    const userMetadata = user.privateMetadata as { role?: string };
    const isAdmin = userMetadata?.role === "admin";
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { email, initialBalance, role } = body;
    
    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }
    
    // Validate role
    if (role !== "user" && role !== "admin") {
      return NextResponse.json(
        { message: "Role must be either 'user' or 'admin'" },
        { status: 400 }
      );
    }
    
    // Validate initial balance
    if (initialBalance < 0) {
      return NextResponse.json(
        { message: "Initial balance cannot be negative" },
        { status: 400 }
      );
    }
    
    // Create user in Clerk
    const createdUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: Math.random().toString(36).slice(-10), // Generate a random password
    });
    
    // Set the user's role in Clerk metadata
    await clerkClient.users.updateUser(createdUser.id, {
      privateMetadata: {
        role: role,
      },
    });
    
    // Create user in database
    const { accountNumber } = await createUser(
      createdUser.id,
      email,
      role,
      initialBalance
    );
    
    // Return success response
    return NextResponse.json({
      message: "User created successfully",
      userId: createdUser.id,
      accountNumber: accountNumber,
    });
    
  } catch (error) {
    console.error("Error in /api/users/create:", error);
    
    // Check if error is from Clerk (email already exists)
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}