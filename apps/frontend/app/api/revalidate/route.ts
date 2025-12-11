import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

const tagList = ["guests", "uploads", "polls", "current-user"] as const;

export async function POST() {
  const headerList = await headers();
  const authHeader = headerList.get("Authorization");

  if (!authHeader) {
    return Response.json(
      { revalidated: false, error: "No auth header" },
      { status: 403 }
    );
  }

  const token = authHeader.toLowerCase().startsWith("bearer")
    ? authHeader.substring(6).trim()
    : authHeader.trim();

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (!token || token !== process.env.REVALIDATE_KEY) {
    return Response.json(
      { revalidated: false, error: "Invalid key" },
      { status: 403 }
    );
  }

  for (const tag of tagList) {
    revalidateTag(tag, "max");
  }

  return Response.json({ revalidated: true });
}
