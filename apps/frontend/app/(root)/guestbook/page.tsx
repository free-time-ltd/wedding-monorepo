import { GuestbookSubmitForm } from "@/components/guestbook/form-card";
import { MessageList } from "@/components/guestbook/message-list";
import { fetchGuestbook } from "@/lib/data";
import { fetchUser } from "@/lib/server-data";
import { Heart } from "@repo/ui/icons";
import { pluralizeWithCount } from "@repo/utils/pluralize";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Пожелания",
  description:
    "Оставете своите сърдечни пожелания и поздравления за младоженците. Вашите думи ще се превърнат в скъпи спомени, които ще пазим завинаги.",
};

export default async function GuestbookPage() {
  const user = await fetchUser();
  if (!user) {
    redirect(`/guest-select?redirectTo=${encodeURIComponent("/guestbook")}`);
  }

  const approvedMessages = await fetchGuestbook();

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
            <Heart className="h-8 w-8 text-accent fill-accent" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            Пожелания
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Оставете своите сърдечни пожелания и поздравления за младоженците.
            Вашите думи ще се превърнат в скъпи спомени, които ще пазим
            завинаги.
          </p>
        </div>

        <GuestbookSubmitForm />

        {/* Messages Count */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl text-foreground">
            Съобщения от гостите
          </h2>
          <span className="text-sm text-muted-foreground">
            {pluralizeWithCount(
              approvedMessages.length,
              "съобщение",
              "съобщения"
            )}
          </span>
        </div>

        <MessageList
          initialMessages={approvedMessages}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
