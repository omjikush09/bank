import { clerkMiddleware ,createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

const isProtectedRoute= createRouteMatcher(['/dashboard','/admin/users','/admin/deposit','/transactions','/transfer'])

export default clerkMiddleware(async (auth, req) => {
	// Handle authenticated requests
  if(isProtectedRoute(req)) await auth.protect();

});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/(api|trpc)(.*)"],
};
