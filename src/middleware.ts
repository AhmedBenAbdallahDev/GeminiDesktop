import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // For now, let's bypass everything to test the app
  // TODO: Re-add i18n and authentication after we fix the core issues

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes (/api)
    // - static files (_next/static)
    // - images (_next/image)
    // - favicon and other assets
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
