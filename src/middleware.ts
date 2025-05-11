import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, req) => {
  console.log('🔐 Clerk middleware running on:', req.nextUrl.pathname);
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!api/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
};
