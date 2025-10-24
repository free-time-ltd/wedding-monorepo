import { getUserId } from "@/utils";
import { db } from "@repo/db/client";
import { Hono } from "hono";

const roomsRouter = new Hono();

roomsRouter.get("/:id", async (c) => {
  const { id } = c.req.param();

  const roomRes = await db.query.roomsTable.findFirst({
    where: (rooms, { eq }) => eq(rooms.id, id),
    with: {
      userRooms: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              extras: true,
            },
            with: {
              table: true,
            },
          },
        },
      },
    },
  });

  if (!roomRes) {
    return c.json({ success: false, error: "room not found" }, { status: 404 });
  }

  if (roomRes.isPrivate) {
    const userId = await getUserId(c);

    if (!userId) {
      return c.json({ success: false, error: "No session cookie" });
    }

    const roomUsers = roomRes.userRooms.map((userRoom) => userRoom.userId);

    if (!roomUsers.includes(userId)) {
      return c.json(
        { status: false, error: "You don't have access to this room." },
        { status: 403 }
      );
    }
  }

  const guests = roomRes.isPrivate
    ? roomRes.userRooms.map((userRoom) => ({
        ...userRoom.user,
        table: {
          ...userRoom.user?.table,
          label: userRoom.user?.table?.label ?? userRoom.user?.table?.name,
        },
      }))
    : (await db.query.usersTable.findMany({ with: { table: true } })).map(
        (user) => ({
          ...user,
          table: {
            ...user.table,
            label: user.table?.label ?? user.table?.name,
          },
          joinedAt: new Date(),
        })
      );

  const transformedRoom = {
    id: roomRes.id,
    name: roomRes.name,
    isPrivate: roomRes.isPrivate,
    guests,
  };

  return c.json({ success: true, data: transformedRoom });
});

export default roomsRouter;
