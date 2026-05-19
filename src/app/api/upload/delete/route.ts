import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_PREFIX = "uploads/";

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawPaths: unknown = body?.paths;

    if (!Array.isArray(rawPaths)) {
      return NextResponse.json(
        { error: "paths must be an array of storage keys" },
        { status: 400 },
      );
    }

    // Only allow deleting from the uploads/ prefix to prevent abuse.
    const paths = rawPaths
      .filter((p): p is string => typeof p === "string" && p.length > 0)
      .map((p) => p.trim())
      .filter((p) => p.startsWith(ALLOWED_PREFIX) && !p.includes(".."));

    if (paths.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    const { error } = await supabase.storage
      .from("blog-images")
      .remove(paths);

    if (error) {
      console.error("Storage delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete files" },
        { status: 500 },
      );
    }

    return NextResponse.json({ deleted: paths.length });
  } catch (error) {
    console.error("Delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
