const fetchRsvp = async (rsvpId: string) => {
  const url = new URL(
    `/api/rsvps/${rsvpId}`,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );

  const res = await fetch(url, { cache: "force-cache" });
  const json = await res.json();

  return json?.data;
};

export default async function RsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rsvp = await fetchRsvp(slug);

  return (
    <div>
      <p>Well?</p>
      <p>{JSON.stringify(rsvp)}</p>
    </div>
  );
}
