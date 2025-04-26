import { SignIn,SignInButton,SignUpButton,SignedOut } from "@clerk/nextjs";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<div className="mb-6 flex items-center gap-2 text-2xl font-bold">
				<Shield className="h-8 w-8 text-primary" />
				<span>SecureBank</span>
			</div>
			<div className="w-full max-w-sm">
				<SignedOut>
					<SignInButton />
					<SignUpButton />
				</SignedOut>
			</div>
		</div>
	);
}