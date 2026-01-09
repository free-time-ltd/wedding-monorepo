import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar, MapPin } from "@repo/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 -z-10">
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        <img
          src="/hero-bg.jpg"
          alt="Wedding venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/50 via-background/80 to-background" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <p className="text-xl md:text-2xl text-muted-foreground font-light opacity-0 animate-fadeup delay-200">
            Добре дошли на сватбата на
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-balance text-foreground opacity-0 animate-fadeup delay-500">
            Кристина &amp; Лъчезар
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-muted-foreground opacity-0 animate-fadeup delay-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span className="text-lg">Юни 27, 2026</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <Link href="/venue">
              <span className="text-lg hover:underline">
                Colibri Pool Plovdiv
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 opacity-0 animate-fadeup">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <Link href="/guest-select">Портал за Гости</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <Link href="/venue">Вижте Локация</Link>
          </Button>
        </div>
      </div>
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={
                new Date("2026-06-27T19:00:00").getTime() < Date.now()
                  ? "#wedding-details"
                  : "#wedding-date"
              }
              className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center cursor-pointer"
            >
              <div className="w-1.5 h-3 bg-primary/60 rounded-full mt-2 animate-bounce" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Виж повече</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </section>
  );
}
