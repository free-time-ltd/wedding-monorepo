import { Metadata } from "next";
import { RsvpPage } from "@/components/rsvp/rsvp-page";
import { RsvpResponse } from "@/store/chatStore";

const fetchRsvp = async (rsvpId: string) => {
  const url = new URL(
    `/api/rsvps/${rsvpId}`,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );

  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();

  return json?.data;
};

export async function generateMetadata({
  params,
}: PageProps<"/rsvp/[slug]">): Promise<Metadata> {
  const { slug: guestId } = await params;

  const data: RsvpResponse = await fetchRsvp(guestId);

  return {
    title: `Покана за сватба за ${data.guest.name} | Криси и Лъчо 27.06.2026`,
  };
}

export default async function RSVPPage({ params }: PageProps<"/rsvp/[slug]">) {
  const { slug: guestId } = await params;
  const { guest, invitation } = (await fetchRsvp(guestId)) as RsvpResponse;

  return <RsvpPage guestId={guestId} guest={guest} invitation={invitation} />;
}
