import { decodeToken } from "@/lib/jwt";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode, use } from "react";

export const metadata: Metadata = {
  title: "Администрация",
};

export default function GuestLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = use(cookies());
  const idToken = cookieStore.get("cog_token")?.value;
  if (!idToken) {
    redirect("/login");
  }

  const decodedUser = decodeToken(idToken);

  const user = {
    id: decodedUser.sub,
    name: [decodedUser.given_name, decodedUser.family_name].join(" "),
    email: decodedUser.email,
  };

  return (
    <main className="min-h-screen space-y-4">
      <article className="page-content pt-12 sm:pt-16">{children}</article>
      <p className="text-center">{JSON.stringify(user)}</p>
    </main>
  );
}
