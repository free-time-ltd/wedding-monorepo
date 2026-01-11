import { Heart } from "@repo/ui/icons";

export function Footer() {
  return (
    <footer className="py-12 px-6 bg-cream-dark/30 text-center">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-serif text-3xl text-primary mb-4">
          Kristina &amp; Lachezar
        </h3>
        <p className="text-subheading text-muted-foreground mb-6">27.06.2026</p>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <span className="text-body">Made with</span>
          <Heart className="w-4 h-4 text-accent fill-accent" />
          <span className="text-body">for our special day</span>
        </div>
        <p className="text-label text-muted-foreground/60 mt-8">
          #KrisiAndLacho2026
        </p>
      </div>
    </footer>
  );
}
