
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";



const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
  "/import(.*)",
]);

// ---- MAIN MIDDLEWARE ----
export default createMiddleware(async (req) => {
  // 1️⃣ Run Arcjet


  // 2️⃣ Run Clerk
  return clerkMiddleware((auth, req) => {
    const { userId } = auth();
    if (!userId && isProtectedRoute(req)) {
      return auth().redirectToSignIn();
    }
  })(req); // <-- IMPORTANT
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
