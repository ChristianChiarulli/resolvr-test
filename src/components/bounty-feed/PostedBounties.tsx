"use client";

import { useEffect } from "react";

import { type UseListEventsParams } from "~/nostr-query/types";
import useListEvents from "~/nostr-query/useListEvents";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event, type Filter } from "nostr-tools";

import { ToastAction } from "../ui/toast";
import { useToast } from "../ui/use-toast";
import BountyLoadButton from "./BountyLoadButton";
import BountyCard from "./BountyCard";

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
  const { postedBountyEvents, setPostedBountyEvents, addProfile } = useEventStore();
  const { subRelays } = useRelayStore();

  useEffect(() => {
    if (initialProfiles.length > 0) {
      initialProfiles.forEach((profile) => {
        addProfile(profile.pubkey, profile);
      });
    }
  }, [initialProfiles]);
  const { toast } = useToast();

  const onEventsNotFound = () => {
    toast({
      title: "No bounties found",
      description: "There are no more bounties to display at this time.",
      action: (
        <ToastAction onClick={addMorePosts} altText="Try again">
          Try again
        </ToastAction>
      ),
    });
  };

  const params: UseListEventsParams = {
    filter: filter,
    relays: subRelays,
    initialEvents: postedBountyEvents || initialBounties,
    onEventsResolved: (events) => {
      setPostedBountyEvents(events);
    },
    onEventsNotFound: onEventsNotFound,
  };

  const { loading, loadOlderEvents } = useListEvents(params);

  async function addMorePosts(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    await loadOlderEvents(postedBountyEvents, 1);
  }

  return (
    <>
      <ul className="flex w-full flex-col">
        {(postedBountyEvents.length > 0 ? postedBountyEvents : initialBounties).map(
          (bountyEvent) => (
            <BountyCard key={bountyEvent.id} bountyEvent={bountyEvent} />
          ),
        )}
      </ul>
      <BountyLoadButton
        postsLength={postedBountyEvents.length}
        loadFn={addMorePosts}
        loading={loading}
      />
    </>
  );
}
