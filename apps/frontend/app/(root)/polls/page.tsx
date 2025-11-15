import { PollList } from "@/components/poll-list";
import { fetchPollsServer, fetchUser } from "@/lib/server-data";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { CheckCircle2, TrendingUp, Trophy, Users } from "@repo/ui/icons";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { use } from "react";

export const metadata: Metadata = {
  title: "Познай какво ще стане!",
  description:
    "Направете своите предположения и вижте какво мислят другите гости! Гласувайте на тези забавни въпроси и се върнете по-късно, за да видите резултатите.",
};

export const dynamic = "force-dynamic";

export default function PollsPage() {
  const user = use(fetchUser());
  if (!user) {
    redirect(`/guest-select?redirectTo=${encodeURIComponent("/polls")}`);
  }

  const data = use(fetchPollsServer());
  if (!data) {
    return notFound();
  }

  const { polls, totalVotes, userVotes } = data;

  const activePolls = polls.filter((poll) => poll.active).length;

  return (
    <main className="container mx-auto px-4 pt-24 pb-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Trophy className="h-4 w-4" />
          Сватбени Предсказания
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
          Заложете своята прогноза
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Направете своите предположения и вижте какво мислят другите гости!
          Гласувайте на тези забавни въпроси и се върнете по-късно, за да видите
          резултатите.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalVotes}
                </p>
                <p className="text-sm text-muted-foreground">Общо гласа</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activePolls}
                </p>
                <p className="text-sm text-muted-foreground">Активни анкети</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userVotes}
                </p>
                <p className="text-sm text-muted-foreground">Ваш облог</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Polls */}
      <PollList polls={polls} />
    </main>
  );
}
