import { db } from "./client";
import UrlFactory from "@repo/utils/urlFactory";
import mimeToExt from "@repo/utils/mimeToExt";

export const findUser = async (userId: string) => {
  const user = await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      table: {
        with: {
          guests: {
            columns: {
              id: true,
              name: true,
              extras: true,
            },
          },
        },
      },
      userRooms: {
        columns: {
          roomId: true,
          joinedAt: true,
        },
        with: {
          room: true,
        },
      },
    },
  });

  if (!user) return null;

  const publicRooms = await db.query.roomsTable.findMany({
    where: (columns, { eq }) => eq(columns.isPrivate, false),
  });

  const rooms = [
    ...publicRooms,
    ...(user.userRooms.map((ur) => ur.room) || []),
  ];

  return {
    ...user,
    rooms,
  };
};

export type UserBaseType = NonNullable<Awaited<ReturnType<typeof findUser>>>;

export const transformUser = (user: UserBaseType) => {
  return {
    id: user.id,
    name: user.name,
    extras: user.extras,
    table: { ...user.table, label: user.table?.label ?? user.table?.name },
    rooms: user.rooms,
  };
};

export type UserApiType = NonNullable<ReturnType<typeof transformUser>>;

export const findRoom = (roomId: string) =>
  db.query.roomsTable.findFirst({
    where: (table, { eq }) => eq(table.id, roomId),
    with: {
      userRooms: {
        with: {
          user: {
            with: {
              table: true,
            },
          },
        },
      },
      messages: {
        limit: 10,
        orderBy: (table, { desc }) => desc(table.id),
      },
    },
  });

export type RoomBaseType = NonNullable<Awaited<ReturnType<typeof findRoom>>>;

export const transformRoom = ({
  id,
  name,
  isPrivate,
  ...room
}: RoomBaseType) => {
  return {
    id,
    name,
    isPrivate,
    guests: room.userRooms.map(({ user }) => ({
      id: user?.id,
      name: user?.name,
      tableId: user?.tableId,
      table: {
        id: user?.tableId,
        name: user?.table?.name,
        label: user?.table?.label,
      },
    })),
    messages: new Set(
      room.messages.map((msg) => ({
        ...msg,
        createdAt: room.createdAt.getTime(),
      }))
    ),
    lastMessage: room.messages.at(0) ?? null,
  };
};

export type RoomApiType = ReturnType<typeof transformRoom>;

interface ImageFinderProps {
  cursor?: string;
  limit?: number;
}
export const findProcessedImages = ({
  cursor,
  limit = 20,
}: ImageFinderProps = {}) => {
  return db.query.guestUploadsTable.findMany({
    with: {
      user: {
        columns: { id: true, name: true, extras: true },
        with: { table: true },
      },
    },
    where: (table, { and, lt, notInArray }) =>
      and(
        notInArray(table.status, ["pending", "rejected"]),
        cursor ? lt(table.id, cursor) : undefined
      ),
    orderBy: (table, { desc }) => desc(table.id),
    limit,
  });
};

export type ProcessedImageBaseType = NonNullable<
  Awaited<ReturnType<typeof findProcessedImages>>[number]
>;

export const transformProcessedImage = (image: ProcessedImageBaseType) => {
  return {
    id: image.id,
    key: image.s3Key,
    originalFilename: image.origFilename,
    width: image.width,
    height: image.height,
    images: {
      original: `/uploads/${image.s3Key}.${mimeToExt(image.mimeType as string)}`,
      thumb: `/processed/thumbnail/${image.s3Key}.webp`,
      hd: `/processed/full/${image.s3Key}.webp`,
      lq: `/processed/medium/${image.s3Key}.webp`,
    },
    message: image.message,
    createdAt: image.createdAt,
    user: {
      ...image.user,
      table: {
        ...image.user.table,
        label: image.user.table?.label ?? image.user.table?.name,
      },
    },
  };
};

export const transformProcessedImageWithFullUrl =
  (domain: string, secure = true) =>
  (image: ProcessedImageBaseType) => {
    const urlFactory = new UrlFactory(domain, secure);
    const transformed = transformProcessedImage(image);

    return {
      ...transformed,
      images: Object.fromEntries(
        Object.entries(transformed.images).map(([key, path]) => [
          key,
          urlFactory.create(path),
        ])
      ),
    };
  };

export type ProcessedImageApiType = ReturnType<typeof transformProcessedImage>;
