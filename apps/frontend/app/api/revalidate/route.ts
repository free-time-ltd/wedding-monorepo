import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

const tagList = [
  "guests",
  "uploads",
  "polls",
  "hotels",
  "guestbook",
  "current-user",
] as const;

type RevalidateTag = (typeof tagList)[number];

export async function POST(req: NextRequest) {
  const tagParam = req.nextUrl.searchParams.get("tag");

  if (!!tagParam && tagList.includes(tagParam as RevalidateTag)) {
    revalidateTag(tagParam as RevalidateTag, "max");
    return Response.json({ revalidated: true, tag: tagParam });
  }

  for (const tag of tagList) {
    revalidateTag(tag, "max");
  }

  return Response.json({ revalidated: true });
}
