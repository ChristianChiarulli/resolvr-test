"use client";

import { useEffect } from "react";

import nq from "~/nostr-query";
import { revalidateCachedTag } from "~/nostr-query/server";
import { type UseListEventsParams } from "~/nostr-query/types";
import useListEvents from "~/nostr-query/useListEvents";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { revalidateTag } from "next/cache";
import { type Event, type Filter } from "nostr-tools";

import { Button } from "../ui/button";
import Bounty from "./Bounty";
import BountyLoadButton from "./BountyLoadButton";

type Props = {
  initialBounties: Event[];
  filter: Filter;
  initialProfiles: Event[];
};

export default function OpenBounties({
  initialBounties,
  filter,
  initialProfiles,
}: Props) {
  const { newBountyEvents, setNewBountyEvents, addProfile } = useEventStore();
  const { subRelays } = useRelayStore();

  useEffect(() => {
    if (initialProfiles.length > 0) {
      initialProfiles.forEach((profile) => {
        addProfile(profile.pubkey, profile);
      });
    }
  }, [initialProfiles]);

  const params: UseListEventsParams = {
    filter: filter,
    relays: subRelays,
    initialEvents: newBountyEvents || initialBounties,
    onEventsResolved: (events) => {
      setNewBountyEvents(events);
    },
  };

  const { loading, loadOlderEvents } = useListEvents(params);

  async function addMorePosts(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    await loadOlderEvents(newBountyEvents, 1);
  }

  // const invalidate = () => {
  //   revalidateCachedTag("bounties");
  // };

  return (
    <>
      {/* <Button onClick={invalidate} variant="default"> */}
      {/*   invalidate */}
      {/* </Button> */}
      <ul className="flex w-full flex-col">
        {(newBountyEvents.length > 0 ? newBountyEvents : initialBounties).map(
          (bountyEvent) => (
            <Bounty key={bountyEvent.id} bountyEvent={bountyEvent} />
          ),
        )}
      </ul>
      <BountyLoadButton
        postsLength={newBountyEvents.length}
        loadFn={addMorePosts}
        loading={loading}
      />
    </>
  );
}
