"use client";

import { useEffect } from "react";

import { type UseListEventsParams } from "~/nostr-query/types";
import useListEvents from "~/nostr-query/useListEvents";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event, type Filter } from "nostr-tools";

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
  const { openBountyEvents, setOpenBountyEvents, addProfile } = useEventStore();
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
    initialEvents: openBountyEvents || initialBounties,
    onEventsResolved: (events) => {
      setOpenBountyEvents(events);
    },
  };

  const { loading, loadOlderEvents } = useListEvents(params);

  async function addMorePosts(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    await loadOlderEvents(openBountyEvents, 1);
  }

  return (
    <>
      <ul className="flex w-full flex-col">
        {(openBountyEvents.length > 0 ? openBountyEvents : initialBounties).map(
          (bountyEvent) => (
            <Bounty key={bountyEvent.id} bountyEvent={bountyEvent} />
          ),
        )}
      </ul>
      <BountyLoadButton
        postsLength={openBountyEvents.length}
        loadFn={addMorePosts}
        loading={loading}
      />
    </>
  );
}
