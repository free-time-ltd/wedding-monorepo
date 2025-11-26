import { useSearchParams } from "next/navigation";

export function useGalleryFilters() {
  const searchParams = useSearchParams();

  return parseSearchParams(Object.fromEntries(searchParams.entries()));
}

export function parseSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const { sort, uploader, cursor, limit = 20 } = searchParams;

  let orderBy, sortFld;
  switch (sort) {
    case "desc":
    case "asc":
      orderBy = "createdAt";
      sortFld = sort;
      break;
    case "az":
    case "za":
      orderBy = "message";
      sortFld = sort === "az" ? "asc" : "desc";
      break;
  }

  return {
    ...(orderBy && { orderBy }),
    ...(sortFld && { sort: sortFld }),
    ...(cursor && { cursor: Array.isArray(cursor) ? cursor[0] : cursor }),
    ...(limit !== undefined && { limit: String(limit) }),
    ...(uploader && {
      uploader: Array.isArray(uploader) ? uploader[0] : uploader,
    }),
  };
}

/*const { sort, uploader } = await searchParams;
  const user = await fetchUser();
  if (!user) {
    redirect(`/guest-select?redirectTo=${encodeURIComponent("/live-feed")}`);
  }

  const guests = (await fetchGuests()) ?? [];

  let orderBy, sortFld;
  switch (sort) {
    case "desc":
    case "asc":
      orderBy = "createdAt";
      sortFld = sort;
      break;
    case "az":
    case "za":
      orderBy = "message";
      sortFld = sort === "az" ? "asc" : "desc";
      break;
  }
*/
