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

let tabs = [
  { name: "open", icon: NewspaperIcon },
  // { name: "posted", icon: Upload },
  // { name: "assigned", icon: User2 },
  // { name: "disputed", icon: AlertCircle },
];

// export default async function HomePage() {

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
    // console.log("session: ", session);
    const user = session?.user as UserWithKeys;
    publicKey = user.publicKey;
    if (publicKey) {
      loggedIn = true;
    }
  }

  tabs = [
    { name: "open", icon: NewspaperIcon },
    { name: "posted", icon: Upload },
    { name: "assigned", icon: User2 },
    { name: "disputed", icon: AlertCircle },
  ];

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

  // console.log("selectedTab: ", selectedTab);
  // console.log("publicKey: ", publicKey);
  // console.log("loggedIn: ", loggedIn);
  // console.log("filter: ", filter);

  const params: ListEventsParams = {
    filter,
    relays: ["wss://nos.lol", "wss://relay.damus.io"],
  };

  let cacheTags: string[] = [];

  if (selectedTab === "open") {
    cacheTags = ["bounties"];
  }
  if (selectedTab === "posted") {
    cacheTags = [`posted-bounties-${publicKey}`];
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


  // HACK: this is a workaround for dealing with passing symbols
  initialBountyEvents = JSON.parse(
    JSON.stringify(initialBountyEvents),
  ) as Event[];

  // console.log("initialBountyEvents: ", initialBountyEvents);

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
        <OpenBounties initialBounties={initialBountyEvents} filter={filter} />
      )}
      {selectedTab === "posted" && loggedIn && (
        <PostedBounties initialBounties={initialBountyEvents} filter={filter} />
      )}
    </div>
  );
}
