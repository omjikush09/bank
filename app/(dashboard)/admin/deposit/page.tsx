"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

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

const depositSchema = z.object({
  accountNumber: z
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

type DepositFormValues = z.infer<typeof depositSchema>;

export default function DepositPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{ email?: string; balance?: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountParam = searchParams.get("account");
  
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      accountNumber: accountParam || "",
      amount: "",
    },
  });
  
  const accountNumber = form.watch("accountNumber");
  
  // Fetch user data when account number changes
  useState(() => {
    const fetchUserData = async () => {
      if (accountNumber?.length === 10) {
        try {
          const response = await fetch(`/api/users/account/${accountNumber}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };
    
    fetchUserData();
  });
  
  async function onSubmit(data: DepositFormValues) {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNumber: data.accountNumber,
          amount: parseFloat(data.amount),
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to deposit funds");
      }
      
      // Show success message
      toast.success("Deposit completed successfully", {
        description: `${formatCurrency(parseFloat(data.amount))} has been deposited`,
      });
      
      // Reset form
      form.reset();
      
      // Redirect to users page after a short delay
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Deposit failed", {
          description: error.message,
        });
      } else {
        toast.error("Deposit failed", {
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
        <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground">
          Add money to a user&apos;s account
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PiggyBank className="mr-2 h-5 w-5" />
            Deposit Funds
          </CardTitle>
          <CardDescription>
            Enter the user&apos;s account number and the amount to deposit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 10-digit account number" {...field} />
                    </FormControl>
                    <FormDescription>
                      {userData?.email ? (
                        <span className="text-emerald-500">
                          User found: {userData.email}
                        </span>
                      ) : (
                        "Enter the 10-digit account number"
                      )}
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
                      {userData?.balance && (
                        <span>Current balance: {formatCurrency(userData.balance)}</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !userData?.email}
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Deposit Funds
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Deposits are processed immediately and will be available in the user&apos;s account.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}