import { db } from "@repo/db/client";

export const findUser = (userId: string) => {
  return db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      table: {
        with: {
          guests: true,
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

export const transformUser = (
  user: NonNullable<Awaited<ReturnType<typeof findUser>>>
) => {
  return {
    id: user.id,
    name: user.name,
    extras: user.extras,
    table: { ...user.table, label: user.table?.label ?? user.table?.name },
    rooms: user.userRooms.map((userRoom) => ({
      id: userRoom.roomId,
      name: userRoom.room?.name,
      isPrivate: userRoom.room?.isPrivate,
      joinedAt: userRoom.joinedAt,
    })),
  };
};
