import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

  // Just get the current session
  const { data, error } = await supabase.auth.getSession();
  console.log("Session data:", data);
  console.log("Session error:", error);

  // Redirect to home after getting session
  const redirectUrl = new URL("/", request.url);
  return NextResponse.redirect(redirectUrl);
}
