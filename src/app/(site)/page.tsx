import { cache } from "react";

import OpenBounties from "~/components/bounties/OpenBounties";
import PostedBounties from "~/components/bounties/PostedBounties";
import { cn } from "~/lib/utils";
import nq from "~/nostr-query";
import { type ListEventsParams } from "~/nostr-query/types";
import { type UserWithKeys } from "~/types";
import { AlertCircle, NewspaperIcon, Upload, User2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { type Event, type Filter } from "nostr-tools";

import { authOptions } from "../api/auth/[...nextauth]/auth";
import AssignedBounties from "~/components/bounties/AssignedBounties";

let tabs = [{ name: "open", icon: NewspaperIcon }];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const selectedTab = searchParams.tab ?? "open";

  const session = await getServerSession(authOptions);
  let loggedIn = false;
  let publicKey = "";

  if (session?.user) {
    const user = session?.user as UserWithKeys;
    publicKey = user.publicKey;
    if (publicKey) {
      loggedIn = true;
      tabs = [
        { name: "open", icon: NewspaperIcon },
        { name: "posted", icon: Upload },
        { name: "assigned", icon: User2 },
        // { name: "disputed", icon: AlertCircle },
      ];
    }
  }

  const filter: Filter = {
    kinds: [30050],
    limit: 3,
  };

  if (selectedTab === "open") {
    filter["#s"] = ["open"];
  }

  if (selectedTab === "posted") {
    filter.authors = [publicKey];
  }

  if (selectedTab === "assigned") {
    filter["#p"] = [publicKey];
  }

  const params: ListEventsParams = {
    filter,
    relays: ["wss://nos.lol", "wss://relay.damus.io"],
  };

  let cacheTags: string[] = [];

  if (selectedTab === "open") {
    cacheTags = ["open-bounties", `open-bounties-${publicKey}`];
  }
  if (selectedTab === "posted") {
    cacheTags = [`posted-bounties-${publicKey}`];
  }
  if (selectedTab === "assigned") {
    cacheTags = [`assigned-bounties-${publicKey}`];
  }

  const getCachedEvents = unstable_cache(
    async (params: ListEventsParams) => {
      console.log("CACHING BOUNTY EVENTS");
      const initialBountyEvents: Event[] = (await nq.list(params)) as Event[];
      return initialBountyEvents;
    },
    undefined,
    { tags: cacheTags, revalidate: 60 },
  );

  let initialBountyEvents = await getCachedEvents(params);

  const pubkeys = initialBountyEvents.map((event) => event.pubkey);

  const profiles: Event[] = [];

  for (const pubkey of pubkeys) {
    const getCachedProfile = unstable_cache(
      async (pubkey: string) => {
        const profile = await nq.fetchProfile({
          pubkey,
          relays: ["wss://nos.lol", "wss://relay.damus.io"],
        });
        return profile;
      },
      undefined,
      { tags: [pubkey], revalidate: 60 },
    );
    const profile = await getCachedProfile(pubkey);
    if (profile) {
      profiles.push(profile);
    }
  }

  // HACK: this is a workaround for dealing with passing symbols
  initialBountyEvents = JSON.parse(
    JSON.stringify(initialBountyEvents),
  ) as Event[];

  return (
    <div className="min-h-screen w-full flex-col items-center">
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

                <span>{tab.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {selectedTab === "open" && (
        <OpenBounties
          initialBounties={initialBountyEvents}
          filter={filter}
          initialProfiles={profiles}
        />
      )}
      {selectedTab === "posted" && loggedIn && (
        <PostedBounties
          initialBounties={initialBountyEvents}
          filter={filter}
          initialProfiles={profiles}
        />
      )}
      {selectedTab === "assigned" && loggedIn && (
        <AssignedBounties
          initialBounties={initialBountyEvents}
          filter={filter}
          initialProfiles={profiles}
        />
      )}
    </div>
  );
}
