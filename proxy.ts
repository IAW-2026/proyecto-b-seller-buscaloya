import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

//We define public routes that do not require authentication.
//This includes the Clerk webhook route, as well as the sign-in and sign-up pages, and the home page.
//This allows new users to register and Clerk to send webhooks without requiring authentication, while still protecting all other routes by default.
/*The webhook route must be public to allow Clerk to communicate with our application when certain events occur (like user creation), 
  enabling us to automatically create stores for new users without requiring them to authenticate first.*/
const isPublicRoute = createRouteMatcher([
  '/api/webhooks/clerk(.*)', 
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};