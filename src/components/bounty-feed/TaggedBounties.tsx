"use client";

import { type UseListEventsParams } from "~/nostr-query/types";
import useListEvents from "~/nostr-query/useListEvents";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Filter } from "nostr-tools";

import BountyCard from "./BountyCard";
import BountyLoadButton from "./BountyLoadButton";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";

type Props = {
  filter: Filter;
  tag: string;
};

export default function TaggedBounties({ filter, tag }: Props) {
  const { tagEventsMap, setTagEvents } = useEventStore();
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
    initialEvents: tagEventsMap[tag],
    onEventsResolved: (events) => {
      setTagEvents(tag, events);
    },
    onEventsNotFound: onEventsNotFound,
  };


  const { loading, noEvents, loadOlderEvents } = useListEvents(params);

  async function addMorePosts(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    await loadOlderEvents(tagEventsMap[tag], 1);
  }

  return (
    <>
      <ul className="flex w-full flex-col">
        {(tagEventsMap?.[tag] ?? []).map((bountyEvent) => (
          <BountyCard key={bountyEvent.id} bountyEvent={bountyEvent} />
        ))}
      </ul>
      <div>
        {noEvents && (
            <div className="flex flex-col items-center justify-center">
              <div className="text-lg font-medium text-gray-500">
                No bounties found
              </div>
              <div className="text-sm text-gray-500">
                There are no more bounties to display at this time.
              </div>
            </div>
          )}
      </div>
      <BountyLoadButton
        postsLength={tagEventsMap[tag]?.length ?? 0}
        loadFn={addMorePosts}
        loading={loading}
      />
    </>
  );
}
