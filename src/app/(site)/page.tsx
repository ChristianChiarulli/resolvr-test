import AssignedBounties from "~/components/bounty-feed/AssignedBounties";
import BountyFilter from "~/components/bounty-feed/BountyFilter";
import BountyTags from "~/components/bounty-feed/BountyTags";
import OpenBounties from "~/components/bounty-feed/OpenBounties";
import PostedBounties from "~/components/bounty-feed/PostedBounties";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import nq from "~/nostr-query";
import { type ListEventsParams } from "~/nostr-query/types";
import { type UserWithKeys } from "~/types";
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { type Event, type Filter } from "nostr-tools";

import { authOptions } from "../api/auth/[...nextauth]/auth";

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
      const initialBountyEvents: Event[] = (await nq.list(params))!;
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
      {loggedIn && (
        <div className="flex flex-col py-4">
          <Tabs defaultValue={selectedTab}>
            <div className="flex items-center justify-between">
              <h1 className="select-none text-center text-3xl font-bold">
                Bounties
              </h1>
              <div className="mr-1 flex items-center">
                <TabsList className="bg-secondary/90">
                  <TabsTrigger asChild value="open">
                    <Link href={"?tab=open"} replace={true}>
                      Open
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger asChild value="posted">
                    <Link href={"?tab=posted"} replace={true}>
                      Posted
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger asChild value="assigned">
                    <Link href={"?tab=assigned"} replace={true}>
                      Assigned
                    </Link>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>

          <div className="mb-2 mt-3 flex gap-x-2">
            <BountyTags />
            {/* <BountyFilter /> */}
          </div>
        </div>
      )}

      {selectedTab === "open" && (
        <OpenBounties
          initialBounties={initialBountyEvents}
          filter={filter}
          initialProfiles={profiles}
        />
      )}
      {selectedTab === "posted" && (
        <PostedBounties
          initialBounties={initialBountyEvents}
          filter={filter}
          initialProfiles={profiles}
        />
      )}
      {selectedTab === "assigned" && (
        <AssignedBounties
          initialBounties={initialBountyEvents}
          filter={filter}
          initialProfiles={profiles}
        />
      )}
    </div>
  );
}
