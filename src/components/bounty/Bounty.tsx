"use client";

import { useEffect } from "react";

import { type UseGetEventParams } from "~/nostr-query/types";
import useGetEvent from "~/nostr-query/useGetEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event, type Filter } from "nostr-tools";

import BountyMetadata from "./BountyMetadata";
import BountyTabs from "./BountyTabs";

type Props = {
  initialBounty: Event | undefined | null;
  selectedTab: string;
  filter: Filter;
};

export default function Bounty({ initialBounty, selectedTab, filter }: Props) {
  const { subRelays } = useRelayStore();
  const { currentBounty, setCurrentBounty } = useEventStore();

  const getBountyParams: UseGetEventParams = {
    filter: filter,
    relays: subRelays,
    initialEvent: currentBounty ?? initialBounty,
    onEventResolved: (event) => {
      setCurrentBounty(event);
      // get
    },
  };

  useGetEvent(getBountyParams);

  useEffect(() => {
    return () => {
      setCurrentBounty(undefined);
    };
  }, []);

  return (
    <div className="mt-8 flex flex-col gap-y-4">
      <BountyMetadata bounty={currentBounty} />
      <BountyTabs bounty={currentBounty} selectedTab={selectedTab} />
    </div>
  );
}
