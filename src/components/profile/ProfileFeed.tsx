"use client";

import { type UseListEventsParams } from "~/nostr-query/types";
import useListEvents from "~/nostr-query/useListEvents";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Filter } from "nostr-tools";

import BountyCard from "../bounty-feed/BountyCard";
import BountyLoadButton from "../bounty-feed/BountyLoadButton";
import { ToastAction } from "../ui/toast";
import { useToast } from "../ui/use-toast";

type Props = {
  pubkey: string;
  filter: Filter;
};

export default function OpenBounties({ pubkey, filter }: Props) {
  const { profileBounties, setProfileBounties } = useEventStore();
  const { subRelays } = useRelayStore();

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
    initialEvents: profileBounties[pubkey],
    onEventsResolved: (events) => {
      setProfileBounties(pubkey, events);
    },
    onEventsNotFound: onEventsNotFound,
  };

  const { loading, loadOlderEvents } = useListEvents(params);

  async function addMorePosts(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    await loadOlderEvents(profileBounties[pubkey], 1);
  }

  return (
    <div className="flex w-full flex-col">
      <ul className="flex w-full flex-col">
        {(profileBounties[pubkey] ?? []).map((bountyEvent) => (
          <BountyCard
            key={bountyEvent.id}
            bountyEvent={bountyEvent}
            showProfileInfo={false}
          />
        ))}
      </ul>
      <BountyLoadButton
        postsLength={profileBounties[pubkey]?.length ?? 0}
        loadFn={addMorePosts}
        loading={loading}
      />
    </div>
  );
}
