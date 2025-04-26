import { auth } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserById, getTransactionsByAccount } from "@/lib/db/utils";
import { formatCurrency, formatDate, getTransactionLabel } from "@/lib/utils";

export default async function TransactionsPage() {
  const { userId } = auth();
  
  if (!userId) {
    return <div>Loading...</div>;
  }
  
  const dbUser = await getUserById(userId);
  
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
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">
          View all your past transactions
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filter by:</p>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="incoming">Incoming</SelectItem>
              <SelectItem value="outgoing">Outgoing</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {transactions.length} transactions
          </p>
        </div>
      </div>
      
      <Separator />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>From/To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const { label, isCredit } = getTransactionLabel(
                  transaction.type,
                  transaction.fromAccount,
                  dbUser.accountNumber
                );
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`mr-2 rounded-full p-1 ${
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
                        {label}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>
                      {transaction.type === "deposit" 
                        ? "System Deposit" 
                        : isCredit 
                          ? `From: ${transaction.fromAccount}` 
                          : `To: ${transaction.toAccount}`
                      }
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      isCredit ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}