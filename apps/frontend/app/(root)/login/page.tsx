import { Button } from "@repo/ui/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Вход в системата",
};

export default function LoginPage() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    response_type: "token",
    scope: ["email", "openid", "profile"].join(" "),
    redirect_uri: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/callback`,
  });

  const loginUrl = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}.auth.${process.env.NEXT_PUBLIC_AWS_REGION}.amazoncognito.com/login?${params.toString()}`;

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="container p-8 text-center">
        <Button asChild size="lg">
          <Link href={loginUrl}>Влез в системата</Link>
        </Button>
      </div>
    </main>
  );
}
