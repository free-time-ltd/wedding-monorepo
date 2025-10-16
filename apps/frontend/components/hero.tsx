import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar, MapPin } from "@repo/ui/icons";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 -z-10">
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        <img
          src="/hero-bg.jpg"
          alt="Wedding venue"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            Добре дошли на сватбата на
          </p>
          <h1 className=" text-5xl md:text-7xl lg:text-8xl text-balance text-foreground">
            Kristina &amp; Lachezar
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span className="text-lg">Юни 27, 2026</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <span className="text-lg">Location TBA</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href="/guest-select">Портал за Гости</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/venue">Вижте Локация</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
