"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { 
  PieChart, 
  LayoutDashboard, 
  SendHorizonal, 
  History, 
  Users, 
  PlusCircle, 
  DollarSign, 
  Menu, 
  Shield,
  ArrowLeft,
  X
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { userId } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  
  // Get user role from metadata
  const userMetadata = user?.privateMetadata as { role?: string };
  const isAdmin = userMetadata?.role === "admin";
  
  const userRoutes = [
    {
      icon: LayoutDashboard,
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: SendHorizonal,
      href: "/transfer",
      label: "Transfer Money",
    },
    {
      icon: History,
      href: "/transactions",
      label: "Transactions",
    },
  ];
  
  const adminRoutes = [
    {
      icon: Users,
      href: "/admin/users",
      label: "Manage Users",
    },
    {
      icon: DollarSign,
      href: "/admin/deposit",
      label: "Deposit Funds",
    },
    {
      icon: PlusCircle,
      href: "/admin/create-user",
      label: "Create User",
    },
  ];
  
  const routes = isAdmin 
    ? [...userRoutes, ...adminRoutes] 
    : userRoutes;

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] pr-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-2 py-4 border-b">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">SecureBank</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-2 py-2">
                  <nav className="grid gap-1">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setOpen(false)}
                      >
                        <span
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            pathname === route.href ? "bg-accent text-accent-foreground" : "transparent"
                          )}
                        >
                          <route.icon className="h-5 w-5" />
                          {route.label}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </ScrollArea>
              <div className="border-t p-4">
                <div className="flex items-center gap-4 rounded-lg p-2">
                  <UserButton afterSignOutUrl="/" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "Administrator" : "User"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6 text-primary" />
          <span className="hidden md:inline">SecureBank</span>
        </Link>
        {pathname !== "/dashboard" && (
          <Button variant="ghost" size="icon" asChild className="mr-auto">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>
        )}
        <div className="ml-auto flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[220px] flex-col border-r bg-background md:flex">
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                >
                  <span
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === route.href ? "bg-accent text-accent-foreground" : "transparent"
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </span>
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="flex h-16 items-center gap-4 border-t px-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Administrator" : "User"}
              </p>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}