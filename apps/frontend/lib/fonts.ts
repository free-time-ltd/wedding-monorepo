import {
  MonteCarlo as MonteCarloFont,
  Noto_Sans as RegularFont,
} from "next/font/google";

export const MonteCarlo = MonteCarloFont({
  weight: "400",
  variable: "--font-montecarlo",
  subsets: ["latin"],
  display: "swap",
});

export const RobotoSerif = RegularFont({
  weight: ["400", "700"],
  variable: "--font-notosans",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  display: "swap",
});
