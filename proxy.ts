import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/api/(.*)', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/','/stores/(.*)'
]);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If the user is authenticated and tries to access the root path, redirect them based on their role.
  if (userId && req.nextUrl.pathname === '/') {
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    if (role === 'system_admin' || role === 'admin') {
      return NextResponse.redirect(new URL('/admin/stores', req.url));
    }
    return NextResponse.redirect(new URL(`/stores/${userId}`, req.url));
  }

  // Private routes protection: If the route is not public, ensure the user is authenticated. 
  //If not, they will be redirected to the sign-in page by Clerk.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Adin routes protection: If the route is an admin route, check the user's role in the session claims.
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== 'system_admin' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};