"use client";

import { Poll } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { CheckCircle2, Trophy, Users } from "@repo/ui/icons";
import { useState } from "react";
import { Progress } from "@repo/ui/components/ui/progress";
import mapByKey from "@repo/utils/mapByKey";
import { pluralizeWithCount } from "@repo/utils/pluralize";

interface Props {
  polls: Poll[];
}

export function PollList({ polls: initialPolls }: Props) {
  const [pollList, setPollList] = useState(() => mapByKey(initialPolls, "id"));

  const handleVote = (pollId: string, optionId: string) => {
    // Optimistic update
    setPollList((prev) => {
      const poll = prev.get(pollId);
      if (!poll) return prev;

      const option = poll.options.find((option) => option.id === optionId);
      if (!option) return prev;

      const updatedPoll = { ...poll, userVote: optionId };

      const next = new Map(prev);
      next.set(pollId, updatedPoll);
      return next;
    });

    // Actual update request
    updateVoteApi(pollId, optionId);
  };

  const updateVoteApi = async (pollId: string, optionId: string) => {
    try {
      const url = new URL(
        `/api/polls/${pollId}`,
        process.env.NEXT_PUBLIC_API_BASE_URL
      );

      const res = await fetch(url, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: optionId }),
      });

      if (!res.ok) {
        throw new Error("Request not ok", { cause: res });
      }

      const json = await res.json();
      if (json) {
        const { data: newPoll } = json as { success: boolean; data: Poll };
        setPollList((prev) => {
          const next = new Map(prev);
          next.set(pollId, newPoll);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const getLeadingOption = (poll: Poll) => {
    return poll.options.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from(pollList.entries()).map(([, poll]) => {
        const leadingOption = getLeadingOption(poll);
        return (
          <Card key={poll.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-serif">{poll.title}</CardTitle>
              <CardDescription>{poll.subtitle}</CardDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Users className="h-4 w-4" />
                <span>
                  {pluralizeWithCount(poll.totalVotes, "вот", "вота")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={poll.userVote}
                onValueChange={(value) => handleVote(poll.id, value)}
                className="space-y-4"
              >
                {poll.options.map((option) => {
                  const percentage = getPercentage(
                    option.votes,
                    poll.totalVotes
                  );
                  const isLeading =
                    option.id === leadingOption.id && poll.totalVotes > 0;
                  const isUserVote = poll.userVote === option.id;

                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label
                          htmlFor={option.id}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <span
                            className={
                              isUserVote ? "font-medium text-foreground" : ""
                            }
                          >
                            {option.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {percentage}%
                            {isLeading && poll.totalVotes > 0 && (
                              <Trophy className="inline h-3 w-3 ml-1 text-accent" />
                            )}
                          </span>
                        </Label>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </RadioGroup>

              {!!poll.userVote && (
                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm text-accent flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Гласът ви бе отчетен!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
