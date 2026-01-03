"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";

const STORAGE_KEY = "weddingGallerySubscribed";

export function WeddingGallerySignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check if user has already subscribed
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIsSubscribed(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Моля, въведете валиден имейл адрес.");
      return;
    }

    setLoading(true);

    try {
      const url = new URL(
        "/api/gallery/newsletter/subscribe",
        process.env.NEXT_PUBLIC_API_BASE_URL
      );
      const res = await fetch(url, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Възникна проблем със записването на имейл адрес.", {
          cause: res,
        });
      }

      localStorage.setItem(STORAGE_KEY, email);
      setIsSubscribed(true);
      toast.success("Абонаментът е успешен!");
    } catch {
      toast.error("Възникна грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  const resetEmail = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsSubscribed(false);
  };

  return (
    <Card>
      {!isSubscribed ? (
        <>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              Абонирайте се за сватбената галерия
            </CardTitle>
            <CardDescription>
              Оставете своя имейл, за да получите известие, когато снимките от
              професионалния фотограф са готови
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Въведете своя имейл"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Изпращане..." : "Изпрати"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-3">
              Ще получите потвърждение по имейл, че сте се записали.
            </p>
          </CardContent>
        </>
      ) : (
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
          <h2 className="text-xl font-semibold mb-1 font-serif">
            Благодарим ви! 💌
          </h2>
          <p className="text-muted-foreground">
            Вече сте абонирани и ще получите по електронната поща (
            <span className="font-semibold">
              {localStorage.getItem(STORAGE_KEY)}
            </span>
            ), когато галерията е готова.
          </p>
          <p className="text-muted-foreground py-4">
            Ако мислите, че сте допуснали грешка{" "}
            <Button type="button" variant="link" onClick={resetEmail}>
              Опитайте отново
            </Button>
          </p>
        </CardContent>
      )}
    </Card>
  );
}
