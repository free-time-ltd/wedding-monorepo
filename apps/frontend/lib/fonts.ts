import {
  Great_Vibes as GreatVibesFont,
  Noto_Sans as RegularFont,
} from "next/font/google";

export const MonteCarlo = GreatVibesFont({
  weight: "400",
  variable: "--font-montecarlo",
  subsets: ["latin"],
  display: "swap",
});

export const RobotoSerif = RegularFont({
  weight: ["300", "400", "500", "700"],
  variable: "--font-notosans",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  display: "swap",
});
