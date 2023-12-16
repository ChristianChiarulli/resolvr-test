import BackButton from "~/components/bounty/BackButton";
import Bounty from "~/components/bounty/Bounty";
import InvalidNaddr from "~/components/bounty/InvalidNaddr";
import nq from "~/nostr-query";
import { type GetEventParams } from "~/nostr-query/types";
import { unstable_cache } from "next/cache";
import { nip19, type Event, type Filter } from "nostr-tools";

export default async function BountyPage({
  params,
  searchParams,
}: {
  searchParams: Record<string, string>;
  params: Record<string, string>;
}) {
  // console.log("params: ", params);
  // console.log("searchParams: ", searchParams);

  const selectedTab = searchParams.tab ?? "details";

  const naddr = params.naddr;

  try {
    if (!naddr || nip19.decode(naddr).type !== "naddr") {
      return <InvalidNaddr />;
    }
  } catch (e) {
    return <InvalidNaddr />;
  }
  const decodedNaddr = nip19.decode(naddr);
  if (decodedNaddr.type !== "naddr") {
    return <InvalidNaddr />;
  }

  const addressPointer = decodedNaddr.data;

  const kind = addressPointer.kind;
  if (kind !== 30050) {
    return <InvalidNaddr />;
  }
  const identifier = addressPointer.identifier;
  const pubkey = addressPointer.pubkey;
  const relays = addressPointer.relays;

  // get bounty
  // get bounty author
  // get bounty applicants
  // cache bounty
  // cache bounty author
  // cache bounty applicants
  // pass

  const filter: Filter = {
    kinds: [kind],
    limit: 1,
    "#d": [identifier],
  };

  const getEventparams: GetEventParams = {
    relays:
      relays && relays.length > 0
        ? relays
        : ["wss://nos.lol", "wss://relay.damus.io"],
    filter,
  };

  const getCachedEvents = unstable_cache(
    async (params: GetEventParams) => {
      console.log("CACHING SINGLE BOUNTY EVENT");
      return await nq.get(params);
    },
    undefined,
    { tags: [`${identifier}-${pubkey}`], revalidate: 10 },
  );

  let bountyEvent = await getCachedEvents(getEventparams);

  bountyEvent = JSON.parse(JSON.stringify(bountyEvent)) as Event;

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <div className="flex min-h-screen w-full max-w-4xl flex-col">
        <BackButton />
        <Bounty initialBounty={bountyEvent} selectedTab={selectedTab} />
      </div>
    </div>
  );
}
