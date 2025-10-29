import {
  guestUploadsTable,
  messagesTable,
  roomsTable,
  tablesTable,
  usersTable,
} from "./schema";
import { db } from "./client";
import { generateId } from "@repo/utils/generateId";

const usernames = [
  "Лъчезар Цочев",
  "Кристина Костова",
  "Мария Нешева",
  "Стоян Капитанов",
  "Лъчезар Капитанов",
  "Александър Костов",
  "Христина Костова",
  /* STUBS */
  "Александър Бояджиев",
  "Борис Велев",
  "Веселин Георгиев",
  "Георги Димитров",
  "Даниел Енев",
  "Емил Филипов",
  "Живко Генчев",
  "Златомир Христов",
  "Иван Йорданов",
  "Йордан Захариев",
  "Калоян Илиев",
  "Лъчезар Костов",
  "Марин Лазаров",
  "Никола Митев",
  "Огнян Недялков",
  "Петър Обретенов",
  "Радослав Петров",
  "Симеон Радев",
  "Тихомир Стоянов",
  "Угрин Тодоров",
  "Филип Урумов",
  "Христо Филипов",
  "Цветан Хаджиев",
  "Чавдар Цолов",
  "Шенол Шерифов",
  "Щерю Щерев",
  "Ъглен Янков",
  "Юлиян Атанасов",
  "Асен Бъчваров",
  "Божидар Вълчев",
  "Валентин Григоров",
  "Галин Делчев",
  "Десислав Евтимов",
  "Емануил Жеков",
  "Жеко Златков",
  "Здравко Иванов",
  "Илия Йончев",
  "Йоан Караджов",
  "Кирил Лилов",
  "Любомир Маринов",
  "Мартин Николов",
  "Ненко Овчаров",
  "Орлин Панчев",
  "Пламен Русков",
  "Росен Савов",
  "Станимир Тренев",
  "Тодор Ушев",
  "Унчо Фурнаджиев",
  "Филип Харизанов",
  "Христомир Ценов",
  "Цветозар Чакъров",
  "Чавдар Шопов",
  "Шендо Щерев",
  "Щилияна Ангелова",
  "Ъшенка Бонева",
  "Юлия Велева",
  "Ася Георгиева",
  "Боряна Драганова",
  "Весела Енева",
  "Геновева Жекова",
  "Десислава Захариева",
  "Елена Илиева",
  "Жана Йорданова",
  "Зорница Караиванова",
  "Ива Лозанова",
  "Йоана Младенова",
  "Камелия Николова",
  "Лилия Обретенова",
  "Мариела Пенева",
  "Надежда Романова",
];

type UserInsertType = typeof usersTable.$inferInsert;
type TableInsertType = typeof tablesTable.$inferInsert;

export async function seed() {
  const tablesRaw = Array.from({ length: 15 }, (_, i) => i + 1);
  const tables: TableInsertType[] = tablesRaw.map((id) => ({
    name: `Маса #${id}`,
    label: "Лъчо колеги",
  }));

  const users: UserInsertType[] = usernames.map((name) => ({
    id: generateId(),
    name,
    extras: 0,
    tableId: 1,
  }));

  await db.insert(tablesTable).values(tables);
  await db.insert(usersTable).values(users);

  const lobbyRoom = await db
    .insert(roomsTable)
    .values({
      id: "lobby",
      name: "Лоби",
      createdAt: new Date(),
      createdBy: users[1]?.id ?? "",
      isPrivate: false,
    })
    .returning();

  const lobbyId = lobbyRoom.at(0)?.id;
  if (lobbyId) {
    db.insert(messagesTable).values({
      content:
        "Добре дошли на нашата сватба! Тук можете да контактувате със всеки гост!",
      createdAt: new Date(),
      roomId: lobbyId,
      userId: users.at(1)!.id,
    });
  }

  console.log("✅ Seeder completed successfully.");
}

export async function seedImages() {
  const user = await db.query.usersTable.findFirst();
  if (!user) return;

  const images: Array<typeof guestUploadsTable.$inferInsert> = Array.from(
    {
      length: 123,
    },
    (_, i) => ({
      s3Key: generateId(),
      userId: user.id,
      message: `Test image #${i}`,
      mimeType: "image/jpeg",
      origFilename: `test-img-00${i}.jpg`,
      width: 1280,
      height: 1280,
      sizeBytes: 12323124,
      createdAt: new Date(),
      approvedAt: new Date(),
      status: "processed",
    })
  );

  await db.insert(guestUploadsTable).values(images);

  console.log("✅ Seeder completed successfully.");
}
