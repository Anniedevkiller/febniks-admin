import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const isPublicAuthRoute =
    pathname === "/login" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (!isPublicAuthRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // User is signed in — verify profiles.role === 'admin'
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = "/login";
    deniedUrl.searchParams.set("error", "access_denied");
    const redirectResponse = NextResponse.redirect(deniedUrl);
    // Copy any cleared auth cookies from supabaseResponse
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // Admin visiting /login -> redirect to /dashboard
  if (pathname === "/login" || pathname === "/") {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    dashUrl.search = "";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
