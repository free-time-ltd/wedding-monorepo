import { Navigation } from "@/components/navigation";
import { ReactNode } from "react";

export default function GuestLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Navigation />
      <article className="page-content pt-12 sm:pt-16">{children}</article>
    </main>
  );
}
