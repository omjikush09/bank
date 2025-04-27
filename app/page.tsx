import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Shield, RefreshCw, DollarSign } from "lucide-react";
import {SignIn,SignInButton,SignUp,SignUpButton,SignedIn,SignedOut,UserButton} from "@clerk/nextjs"
export default function Home() {
  return (
		<main className="flex min-h-screen flex-col">
			<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2 font-bold text-xl">
						<Shield className="h-6 w-6 text-primary" />
						<span>SecureBank</span>
					</div>
					<div className="flex items-center gap-4">
						<Button variant="ghost" asChild>
							<Link href="/dashboard">Sign In</Link>
						</Button>
					</div>
				</div>
			</nav>

			<section className="flex flex-col items-center justify-center space-y-8 py-24 text-center md:py-32 w-full ">
				<div className="space-y-4 md:w-3/4 lg:w-2/3">
					<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
						Modern Banking for a
						<span className="block text-primary">Secure Future</span>
					</h1>
					<p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
						Experience secure transactions, real-time balance updates, and
						effortless money transfers.
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-4">
					<Button asChild size="lg">
						<Link href="/dashboard">
							Get Started <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</section>

			<section className="py-16 md:py-24 px-28">
				<div className="grid gap-8 md:grid-cols-3">
					<div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
						<Shield className="h-12 w-12 text-primary" />
						<h3 className="text-xl font-bold">Secure Transactions</h3>
						<p className="text-muted-foreground">
							Your financial data is protected with state-of-the-art security.
						</p>
					</div>
					<div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
						<RefreshCw className="h-12 w-12 text-primary" />
						<h3 className="text-xl font-bold">Real-time Updates</h3>
						<p className="text-muted-foreground">
							See your transactions and balance update instantly.
						</p>
					</div>
					<div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
						<DollarSign className="h-12 w-12 text-primary" />
						<h3 className="text-xl font-bold">Easy Transfers</h3>
						<p className="text-muted-foreground">
							Send money to others securely with just a few clicks.
						</p>
					</div>
				</div>
			</section>

			<footer className="border-t py-6 md:py-0 px-6">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<p className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} SecureBank. All rights reserved.
					</p>
				</div>
			</footer>
		</main>
	);
}