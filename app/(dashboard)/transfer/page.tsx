"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const transferSchema = z.object({
  toAccount: z
    .string()
    .length(10, { message: "Account number must be 10 digits" })
    .regex(/^\d+$/, { message: "Account number must contain only digits" }),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Amount must be a valid number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function TransferPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const { user } = useUser();
  const router = useRouter();
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toAccount: "",
      amount: "",
    },
  });
  
  // Fetch the user's account data when component mounts
  useState(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setAccountBalance(parseFloat(data.balance));
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
        toast.error("Failed to fetch account details");
      }
    };
    
    fetchUserData();
  });
  
  async function onSubmit(data: TransferFormValues) {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toAccount: data.toAccount,
          amount: parseFloat(data.amount),
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to transfer funds");
      }
      
      // Update account balance
      setAccountBalance(result.newBalance);
      
      // Show success message
      toast.success("Transfer completed successfully", {
        description: `${formatCurrency(parseFloat(data.amount))} has been sent`,
      });
      
      // Reset form
      form.reset();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Transfer failed", {
          description: error.message,
        });
      } else {
        toast.error("Transfer failed", {
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Money</h1>
        <p className="text-muted-foreground">
          Send money to another account securely
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5" />
            Transfer Funds
          </CardTitle>
          <CardDescription>
            Enter the recipient's account number and the amount to transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="toAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 10-digit account number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the 10-digit account number of the recipient
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {accountBalance !== null && (
                        <span>Available balance: {formatCurrency(accountBalance)}</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    Transfer Funds
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Transfers are processed immediately and cannot be canceled once confirmed.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}