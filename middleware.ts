import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set next_path cookie for /login?next=... (pages cannot modify cookies).
  if (request.nextUrl.pathname === "/login") {
    const next = request.nextUrl.searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      response.cookies.set("next_path", next, { path: "/", sameSite: "lax", maxAge: 60 * 10 });
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Only gate /protected; allow /login through
  if (request.nextUrl.pathname.startsWith("/protected")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/login", "/protected/:path*"],
};

