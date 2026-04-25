import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Use service-level client for anonymous inserts (bypasses RLS with anon key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    // Don't track admin pages
    if (path.startsWith("/admin")) {
      return NextResponse.json({ ok: true });
    }

    await supabase.from("page_views").insert({ path });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
