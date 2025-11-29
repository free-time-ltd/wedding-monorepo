import { Card, CardContent } from "@repo/ui/components/ui/card";
import { LucideProps } from "@repo/ui/icons";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface Props {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  value: string;
  label: string;
}

export function StaticCard({ icon: CardIcon, value, label }: Props) {
  return (
    <Card>
      <CardContent className="flex-col md:flex-row items-center justify-center md:justify-start md:p-4 flex gap-4">
        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
          <CardIcon className="h-6 w-6 text-accent" />
        </div>
        <div className="text-center md:text-start">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
