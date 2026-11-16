import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image size must not exceed 5 MB." },
        { status: 400 }
      );
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";
    const fileName = `meals/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const adminSupabase = createAdminClient();
    const { error: uploadError } = await adminSupabase.storage
      .from("meal-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from("meal-images").getPublicUrl(fileName);

    return NextResponse.json({ image_url: publicUrl, path: fileName });
  } catch {
    return NextResponse.json({ error: "Failed to upload meal photo." }, { status: 500 });
  }
}
