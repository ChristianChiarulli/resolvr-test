"use client";

import { useEffect } from "react";

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { capitalizeFirstLetter, cn, fromNow } from "~/lib/utils";
import nq from "~/nostr-query";
import { type UseGetEventParams } from "~/nostr-query/types";
import useGetEvent from "~/nostr-query/useGetEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { NewspaperIcon, Upload, User2 } from "lucide-react";
import Link from "next/link";
import { type Event, type Filter } from "nostr-tools";

import { Badge } from "../ui/badge";
import ApplyButton from "./ApplyButton";
import BountyDetails from "./BountyDescription";
import Profile from "./Profile";

type Props = {
  initialBounty: Event | undefined | null;
  selectedTab: string;
  filter: Filter;
};

const tabs = [
  { name: "details", icon: NewspaperIcon },
  { name: "applications", icon: Upload },
  { name: "discussion", icon: User2 },
];

export default function Bounty({ initialBounty, selectedTab, filter }: Props) {
  const { subRelays } = useRelayStore();
  const { currentBounty, setCurrentBounty } = useEventStore();

  const params: UseGetEventParams = {
    filter: filter,
    relays: subRelays,
    initialEvent: currentBounty || initialBounty,
    onEventResolved: (event) => {
      setCurrentBounty(event);
    },
  };

  useEffect(() => {
    return () => {
      setCurrentBounty(undefined);
    };
  }, []);

  useGetEvent(params);

  return (
    <div className="mt-8 flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <h1 className="-ml-2 flex items-center text-3xl font-semibold text-orange-500 dark:text-orange-400">
          <SatoshiV2Icon className="h-8 w-8" />
          {Number(nq.tag("reward", currentBounty)).toLocaleString()}
        </h1>
        {nq.tag("s", currentBounty) && (
          <Badge className="text-sm" variant="outline">
            {nq.tag("s", currentBounty)}
          </Badge>
        )}
      </div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {nq.tag("title", currentBounty)}
      </h3>
      <div className="flex items-center justify-between gap-x-2">
        {currentBounty?.pubkey && <Profile pubkey={currentBounty?.pubkey} />}
        <ApplyButton />
      </div>

      <div className="w-full sm:block">
        <div className="border-b">
          <nav
            className="no-scrollbar -mb-px flex space-x-8 overflow-x-auto"
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <Link
                replace={true}
                key={tab.name}
                href={`?tab=${tab.name.toLowerCase()}`}
                className={cn(
                  selectedTab === tab.name.toLowerCase()
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
                    : "border-transparent text-muted-foreground hover:border-primary-foreground hover:text-primary-foreground",
                  "group inline-flex items-center border-b px-1 py-4 text-sm font-medium",
                )}
              >
                <tab.icon
                  className={cn(
                    selectedTab === tab.name.toLowerCase()
                      ? "text-indigo-600 dark:text-indigo-500"
                      : "text-muted-foreground group-hover:text-primary-foreground",
                    "-ml-0.5 mr-2 h-5 w-5",
                  )}
                />

                <span>{capitalizeFirstLetter(tab.name)}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {selectedTab === "details" && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="scroll-m-20 py-2 text-xl font-semibold tracking-tight">
              Bounty Description
            </h4>
            <span className="text-sm text-muted-foreground">
              {fromNow(currentBounty?.created_at) ?? "unknown"}
            </span>
          </div>
          {currentBounty?.content && (
            <BountyDetails details={currentBounty?.content} />
          )}
        </>
      )}
    </div>
  );
}
