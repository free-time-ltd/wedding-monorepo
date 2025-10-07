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
