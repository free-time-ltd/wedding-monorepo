import { notFound, redirect, RedirectType } from "next/navigation";
import { use } from "react";

const fetchUrl = async (slug: string) => {
  try {
    const res = await fetch(
      new URL(`/api/urls/${slug}`, process.env.NEXT_PUBLIC_API_BASE_URL),
      {
        credentials: "include",
        cache: "no-cache",
      }
    );

    if (!res.ok) {
      throw new Error("Response is not ok", { cause: res });
    }

    const { data } = await res.json();

    return data;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export default function ShortenerUrlPage({ params }: PageProps<"/s/[slug]">) {
  const { slug } = use(params);
  const urlModel = use(fetchUrl(slug));

  console.log({ slug, urlModel });

  if (!urlModel) {
    return notFound();
  }

  const url = new URL(
    urlModel.url,
    !urlModel.url.startsWith("http")
      ? process.env.NEXT_PUBLIC_FRONTEND_URL
      : undefined
  );

  return redirect(url.toString(), RedirectType.replace);
}
