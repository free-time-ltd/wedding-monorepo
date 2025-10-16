import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  Gift,
} from "@repo/ui/icons";

export function WeddingDetails() {
  const details = [
    {
      icon: Calendar,
      title: "Запази датата!",
      description: "Юни 27, 2026",
      detail: "Отбележете в календарите си нашия специален ден",
    },
    {
      icon: Clock,
      title: "Назало на Церемонията",
      description: "18:00",
      detail: "Следва коктейлен час и прием",
    },
    {
      icon: MapPin,
      title: "Място",
      description: "Местоположението ще бъде обявено",
      detail: "Подробности ще бъдат споделени скоро",
    },
    {
      icon: Users,
      title: "Списък с гости",
      description: "Само с покана",
      detail: "Проверете списъка с гости, за да видите кой ще присъства",
    },
    {
      icon: MessageCircle,
      title: "Поддържайте връзка",
      description: "Чат за гости",
      detail: "Споделете вълнението с другите гости още преди големия ден",
    },
    {
      icon: Gift,
      title: "Списък с подаръци",
      description: "скоро",
      detail: "Очаквайте скоро информация за сватбения списък.",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-4xl md:text-5xl text-balance text-foreground">
            Детайли за Сватбата!
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Всичко, което трябва да знаете за нашата сватба. Нямаме търпение да
            изживеем този специален момент заедно!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {details.map((item) => (
            <Card
              key={item.title}
              className="border-border hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">
                    {item.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    {item.description}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-8 space-y-4">
              <h3 className="font-serif text-2xl text-foreground">
                Нашата история
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
                Всичко започна в един виртуален свят —{" "}
                <strong>Overwatch</strong>. Случайно се заговорихме, после
                започнахме да играем все по-често, а разговорите ни станаха
                по-важни от самите игри.
              </p>
              <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
                След няколко месеца решихме да се видим на живо — просто защото
                сме от един град. Срещнахме се, харесахме се… и оттогава не сме
                се разделяли.
              </p>
              <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
                Осем години по-късно сме готови за следващата глава от нашата
                история — тази, в която сме отбор не само в игрите, а и в
                живота.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
