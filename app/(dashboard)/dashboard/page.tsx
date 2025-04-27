import { auth, currentUser } from "@clerk/nextjs/server";
import { ArrowUpRight, ArrowDownRight, History, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, getTransactionLabel } from "@/lib/utils";
import { getUserById, getTransactionsByAccount } from "@/lib/db/utils";

export default async function DashboardPage() {
  const { userId } =await auth();
  const user = await currentUser();
  console.log(userId);
  console.log(user);
  if (!userId || !user) {
    return <div>Loading...</div>;
  }
  
  const dbUser = await getUserById(userId);
  console.log(dbUser);
  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h1 className="text-2xl font-bold">Account Not Set Up</h1>
        <p className="text-muted-foreground">
          Your account has not been set up yet. Please contact an administrator.
        </p>
      </div>
    );
  }
  
  const transactions = await getTransactionsByAccount(dbUser.accountNumber);
  const recentTransactions = transactions.slice(0, 5);
  
  // Calculate transaction statistics
  const deposits = transactions.filter(t => 
    t.type === "deposit" || (t.type === "transfer" && t.toAccount === dbUser.accountNumber)
  );
  const withdrawals = transactions.filter(t => 
    t.type === "transfer" && t.fromAccount === dbUser.accountNumber
  );
  
  const totalDeposits = deposits.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  
  // Calculate monthly income progress (for demo purposes)
  const monthlyTarget = 5000;
  const monthlyProgress = Math.min(100, (totalDeposits / monthlyTarget) * 100);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.firstName || user.username}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dbUser.balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Account Number: {dbUser.accountNumber}
            </p>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/transfer">Transfer Money</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money In</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(totalDeposits)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {deposits.length} incoming transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Out</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              {formatCurrency(totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {withdrawals.length} outgoing transactions
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  const { label, isCredit } = getTransactionLabel(
                    transaction.type,
                    transaction.fromAccount,
                    dbUser.accountNumber
                  );
                  
                  return (
                    <div key={transaction.id} className="flex items-center">
                      <div className={`mr-4 rounded-full p-2 ${
                        isCredit ? "bg-emerald-100" : "bg-rose-100"
                      }`}>
                        {isCredit ? (
                          <ArrowDownRight className={`h-4 w-4 ${
                            isCredit ? "text-emerald-500" : "text-rose-500"
                          }`} />
                        ) : (
                          <ArrowUpRight className={`h-4 w-4 ${
                            isCredit ? "text-emerald-500" : "text-rose-500"
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className={`${isCredit ? "text-emerald-500" : "text-rose-500"} font-medium`}>
                        {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/transactions" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  View All Transactions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Your financial activity this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span>Income Progress</span>
                    <span className="text-xs text-muted-foreground">
                      Monthly target: {formatCurrency(monthlyTarget)}
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(totalDeposits)}
                  </span>
                </div>
                <Progress value={monthlyProgress} className="h-2" />
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total In</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {formatCurrency(totalDeposits)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Out</p>
                    <p className="text-2xl font-bold text-rose-500">
                      {formatCurrency(totalWithdrawals)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/transfer">Transfer</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/transactions">History</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}