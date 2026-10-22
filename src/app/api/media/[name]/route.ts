import { promises as fs } from "fs";
import os from "os";
import path from "path";

/* Serves AI-generated images.
   - Vercel: files live in /tmp/jarry-generated (written by the chat API)
   - Local dev: falls back to public/generated for previously saved images */

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!name || !SAFE_NAME.test(name) || name.includes("..")) {
    return Response.json({ error: "Invalid file name" }, { status: 400 });
  }

  const candidates = [
    path.join(os.tmpdir(), "jarry-generated", name),
    path.join(process.cwd(), "public", "generated", name),
  ];

  for (const filePath of candidates) {
    try {
      const data = await fs.readFile(filePath);
      return new Response(new Uint8Array(data), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    } catch {
      /* try next location */
    }
  }

  return Response.json(
    { error: "ছবিটি আর পাওয়া যাচ্ছে না (serverless storage is temporary)" },
    { status: 404 }
  );
}
