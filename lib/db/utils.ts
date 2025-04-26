
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

import { db } from "./index";
import { users, transactions } from "./schema";

// User operations
export async function createUser(
  clerkId: string, 
  email: string, 
  role: "user" | "admin" = "user", 
  initialBalance: number = 0
) {
  const accountNumber = generateAccountNumber();
  
  await db.insert(users).values({
    id: clerkId,
    accountNumber,
    email,
    role,
    balance: initialBalance.toString(),
  });
  
  // If there's an initial balance, create a deposit transaction
  if (initialBalance > 0) {
    await createTransaction(
      null, 
      accountNumber, 
      initialBalance, 
      "deposit"
    );
  }
  
  return { accountNumber };
}

export async function getUserByAccountNumber(accountNumber: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.accountNumber, accountNumber))
    .limit(1);
  
  return result[0] || null;
}

export async function getUserById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function getAllUsers() {
  return db.select().from(users).orderBy(users.createdAt);
}

// Transaction operations
export async function createTransaction(
  fromAccount: string | null, 
  toAccount: string, 
  amount: number, 
  type: "transfer" | "deposit"
) {
  return db.insert(transactions).values({
    id: uuidv4(),
    fromAccount,
    toAccount,
    amount: amount.toString(),
    type,
  });
}

export async function getTransactionsByAccount(accountNumber: string) {
  return db
    .select()
    .from(transactions)
    .where(
      eq(transactions.fromAccount, accountNumber) || 
      eq(transactions.toAccount, accountNumber)
    )
    .orderBy(transactions.createdAt);
}

export async function getAllTransactions() {
  return db
    .select()
    .from(transactions)
    .orderBy(transactions.createdAt);
}

// Balance operations
export async function depositToAccount(accountNumber: string, amount: number) {
  // Get current user
  const user = await getUserByAccountNumber(accountNumber);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Update balance
  const newBalance = parseFloat(user.balance.toString()) + amount;
  
  await db
    .update(users)
    .set({ balance: newBalance.toString() })
    .where(eq(users.accountNumber, accountNumber));
  
  // Create transaction record
  await createTransaction(null, accountNumber, amount, "deposit");
  
  return { newBalance };
}

export async function transferBetweenAccounts(
  fromAccount: string, 
  toAccount: string, 
  amount: number
) {
  // Get source and destination users
  const sourceUser = await getUserByAccountNumber(fromAccount);
  const destUser = await getUserByAccountNumber(toAccount);
  
  if (!sourceUser || !destUser) {
    throw new Error("One or both users not found");
  }
  
  // Check if source has sufficient balance
  const sourceBalance = parseFloat(sourceUser.balance.toString());
  if (sourceBalance < amount) {
    throw new Error("Insufficient balance");
  }
  
  // Update source balance
  const newSourceBalance = sourceBalance - amount;
  await db
    .update(users)
    .set({ balance: newSourceBalance.toString() })
    .where(eq(users.accountNumber, fromAccount));
  
  // Update destination balance
  const destBalance = parseFloat(destUser.balance.toString());
  const newDestBalance = destBalance + amount;
  await db
    .update(users)
    .set({ balance: newDestBalance.toString() })
    .where(eq(users.accountNumber, toAccount));
  
  // Create transaction record
  await createTransaction(fromAccount, toAccount, amount, "transfer");
  
  return { 
    sourceBalance: newSourceBalance,
    destinationBalance: newDestBalance
  };
}

// Helpers
export function generateAccountNumber(): string {
  // Generate a 10-digit account number
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}