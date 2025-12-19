import { NextApiRequest } from "next";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

const tagList = [
  "guests",
  "uploads",
  "polls",
  "hotels",
  "guestbook",
  "current-user",
] as const;

type RevalidateTag = (typeof tagList)[number];

export async function POST(req: NextApiRequest) {
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

  if (!token || token !== process.env.REVALIDATE_KEY) {
    return Response.json(
      { revalidated: false, error: "Invalid key" },
      { status: 403 }
    );
  }

  const { tag: tagParam } = req.query;

  if (tagParam && tagList.includes(tagParam as RevalidateTag)) {
    revalidateTag(tagParam as RevalidateTag, "max");
    return Response.json({ revalidated: true, tag: tagParam });
  }

  for (const tag of tagList) {
    revalidateTag(tag, "max");
  }

  return Response.json({ revalidated: true });
}
