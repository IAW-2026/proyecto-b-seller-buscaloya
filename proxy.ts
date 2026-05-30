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

  // SI YA ESTÁ LOGUEADO Y ESTÁ EN LA LANDING ('/'), LO DESVIAMOS AL DESTINO
  if (userId && req.nextUrl.pathname === '/') {
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    if (role === 'system_admin' || role === 'admin') {
      return NextResponse.redirect(new URL('/admin/stores', req.url));
    }
    return NextResponse.redirect(new URL(`/stores/${userId}`, req.url));
  }

  // PROTECCIÓN DE RUTAS PRIVADAS
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // PROTECCIÓN ADMIN
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