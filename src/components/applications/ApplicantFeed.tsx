"use client";

import { useMemo } from "react";

import nq from "~/nostr-query";
import { type ATagParams, type UseListEventsParams } from "~/nostr-query/types";
import useListEvents from "~/nostr-query/useListEvents";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event, type Filter } from "nostr-tools";

import { ToastAction } from "../ui/toast";
import { useToast } from "../ui/use-toast";
import ApplicationCard from "./ApplicantCard";

type Props = {
  bounty: Event;
};

export default function ApplicationFeed({ bounty }: Props) {
  const { subRelays } = useRelayStore();
  const {
    appEventMap,
    setAppEvents,
    profileToAppEventMap,
    addProfileToAppEventMap,
  } = useEventStore();

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

  const aTagParams: ATagParams = useMemo(
    () => ({
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue: nq.tag("d", bounty) ?? "",
    }),
    [bounty],
  );

  const aTag = useMemo(() => nq.createATag(aTagParams), [aTagParams]);

  const filter: Filter = {
    kinds: [8050],
    limit: 20,
    "#a": [aTag],
  };

  const params: UseListEventsParams = {
    filter: filter,
    relays: subRelays,
    initialEvents: appEventMap[bounty.id],
    onEventsResolved: (events: Event[]) => {
      setAppEvents(bounty.id, events);
      if (events.length > 0) {
        events.forEach((event) => {
          if (!profileToAppEventMap[event.pubkey]) {
            addProfileToAppEventMap(event.pubkey, event);
          }
        });
      }
    },
  };

  const { loading, loadOlderEvents } = useListEvents(params);

  async function addMorePosts(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    await loadOlderEvents(appEventMap[bounty.id], 1);
  }

  return (
    <>
      <ul className="flex w-full flex-col gap-y-4">
        {(appEventMap[bounty.id] ?? []).map((applicationEvent) => (
          <ApplicationCard
            key={bounty.id}
            applicationEvent={applicationEvent}
          />
        ))}
      </ul>
      {/* <BountyLoadButton */}
      {/*   postsLength={openBountyEvents.length} */}
      {/*   loadFn={addMorePosts} */}
      {/*   loading={loading} */}
      {/* /> */}
    </>
  );
}
