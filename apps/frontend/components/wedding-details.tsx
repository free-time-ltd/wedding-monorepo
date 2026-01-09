import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  Camera,
  Heart,
} from "@repo/ui/icons";
import Link from "next/link";
import { BattleNetLogo } from "./battlenet-logo";
import { ReactNode } from "react";

const details = [
  {
    icon: Calendar,
    title: "Запази датата!",
    description: "Юни 27, 2026",
    detail: "Отбележете в календарите си нашия специален ден",
    download: {
      label: "Запази в календара",
      filename: "svatba-krisi-lacho.ics",
      url: "/calendar.ics",
    },
  },
  {
    icon: Clock,
    title: "Начало на Церемонията",
    description: "19:00",
    detail: "Следва коктейлен час и прием",
    href: "/venue",
  },
  {
    icon: MapPin,
    title: "Място",
    description: "Colibri Pool Plovdiv",
    detail:
      "Околовръстен път, на 2 км от кв. Коматево в посока София, Plovdiv, Bulgaria",
    href: "/venue",
  },
  {
    icon: Users,
    title: "Списък с гости",
    description: "Само с покана",
    detail: "Проверете списъка с гости, за да видите кой ще присъства",
    href: "/guests",
  },
  {
    icon: MessageCircle,
    title: "Поддържайте връзка",
    description: "Чат за гости",
    detail: "Споделете вълнението с другите гости още преди големия ден",
    href: "/chat",
  },
  {
    icon: Camera,
    title: "Спомени от Сватбата",
    description: "Споделете снимки и видео",
    detail: "Помогнете ни да съберем всички красиви моменти от вечерта!",
    href: "/live-feed",
  },
];

export type WeddingDetail = (typeof details)[number];

function MaybeLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <>{children}</>;

  return (
    <Link href={href} className="block h-full">
      {children}
    </Link>
  );
}

export function WeddingDetails() {
  return (
    <section className="px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4" id="wedding-details">
          <h2 className="font-serif text-4xl md:text-5xl text-balance text-primary">
            Детайли за Сватбата!
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Всичко, което трябва да знаете за нашата сватба. Нямаме търпение да
            изживеем този специален момент заедно!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {details.map((item) => (
            <MaybeLink href={item.href} key={item.title}>
              <Card className="border-border hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 pt-0 space-y-4 relative">
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
                    {!!item.download && (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <Button variant="link" asChild>
                          <Link
                            href={item.download.url}
                            download={item.download.filename}
                          >
                            {item.download.label}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </MaybeLink>
          ))}
        </div>
      </div>
      <div className="mt-20 md:py-32 px-6 md:px-12 bg-sage-light/30">
        <h3 className="font-serif text-4xl md:text-5xl text-balance text-primary text-center">
          Нашата история
        </h3>
        <div className="py-8">
          <div
            className={`divider-ornament text-accent transition-all duration-700 delay-200`}
          >
            <Heart className="w-4 h-4 fill-accent" />
          </div>
        </div>
        <Card className="border-primary/20 bg-transparent bg-none border-none shadow-none m-0">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
              Всичко започна в един виртуален свят — <strong>Overwatch</strong>.
              Случайно се заговорихме, после започнахме да играем все по-често,
              а разговорите ни станаха по-важни от самите игри.
            </p>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
              След няколко месеца решихме да се видим на живо — просто защото
              сме от един град. Срещнахме се, харесахме се… и оттогава не сме се
              разделяли.
            </p>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
              Осем години по-късно сме готови за следващата глава от нашата
              история — тази, в която сме отбор не само в игрите, а и в живота.
            </p>
          </CardContent>
        </Card>

        <div className="pt-4 pb-2 challenge-us flex justify-center gap-4 items-center flex-col md:flex-row">
          <Button
            className="flex items-center gap-3 px-6 py-5 text-base bg-[#148EFF] hover:bg-[#0f6fd1] text-white shadow-lg shadow-blue-500/30"
            asChild
          >
            <Link
              href="https://tracker.gg/bf6/profile/3187201157/overview"
              target="_blank"
              rel="nofollow"
            >
              <BattleNetLogo className="size-8" />
              Challenge Sk1ppeR#2796
            </Link>
          </Button>

          <Button
            variant="secondary"
            className="flex items-center gap-3 px-6 py-5 text-base bg-[#148EFF] hover:bg-[#0f6fd1] text-white shadow-lg shadow-blue-500/30"
            asChild
          >
            <Link
              href="https://overwatch.blizzard.com/en-us/career/c25fbe8bb17e97aca4a226a5dd08%7Cb9a73e321c5fd1444e499e43f47b5ba8/"
              target="_blank"
              rel="nofollow"
            >
              <BattleNetLogo className="size-8" />
              Challenge Parabola#21599
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
