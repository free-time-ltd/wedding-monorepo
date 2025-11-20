import { revalidateTag } from "next/cache";

const tagList = ["guests", "uploads", "polls", "current-user"] as const;

export async function POST() {
  for (const tag of tagList) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true });
}
