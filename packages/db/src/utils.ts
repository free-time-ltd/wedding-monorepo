/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { db } from "./client";

export const findUser = (userId: string) => {
  return db.query.usersTable.findFirst({
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
};

export type UserBaseType = NonNullable<Awaited<ReturnType<typeof findUser>>>;

export const transformUser = (user: UserBaseType) => {
  return {
    id: user.id,
    name: user.name,
    extras: user.extras,
    table: { ...user.table, label: user.table?.label ?? user.table?.name },
    rooms: user.userRooms.map((userRoom) => ({
      id: userRoom.roomId!,
      name: userRoom.room?.name!,
      isPrivate: userRoom.room?.isPrivate!,
      joinedAt: userRoom.joinedAt!,
    })),
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
