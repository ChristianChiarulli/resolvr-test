import React from "react";

import { capitalizeFirstLetter } from "~/lib/utils";
import { type UseGetEventParams } from "~/nostr-query/types";
import useGetEvent from "~/nostr-query/useGetEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event, type Filter } from "nostr-tools";

import { Badge } from "../ui/badge";
import { tag } from "react-nostr";

type Props = {
  bounty: Event;
};

export default function BountyStatusBadge({ bounty }: Props) {
  const { subRelays } = useRelayStore();
  const { zapRecieptMap, addZapReciept } = useEventStore();

  const filter: Filter = {
    kinds: [9735],
    "#e": [bounty.id],
  };

  const getBountyParams: UseGetEventParams = {
    filter: filter,
    relays: subRelays,
    initialEvent: zapRecieptMap[bounty.id] ?? undefined,
    onEventResolved: (event) => {
      addZapReciept(bounty.id, event);
    },
  };

  useGetEvent(getBountyParams);

  return (
    <>
      {tag("s", bounty) === "open" && (
        <Badge className="text-sm" variant="outline">
          <span className="mr-2 block h-2 w-2 rounded-full bg-yellow-500 dark:text-yellow-400" />
          {capitalizeFirstLetter(tag("s", bounty))}
        </Badge>
      )}
      {bounty &&
        tag("s", bounty) === "assigned" &&
        !zapRecieptMap[bounty.id] && (
          <Badge className="text-sm" variant="outline">
            <span className="mr-2 block h-2 w-2 rounded-full bg-sky-500 dark:text-sky-400" />
            {capitalizeFirstLetter(tag("s", bounty))}
          </Badge>
        )}
      {bounty &&
        tag("s", bounty) === "assigned" &&
        zapRecieptMap[bounty.id] && (
          <Badge className="text-sm" variant="outline">
            <span className="mr-2 block h-2 w-2 rounded-full bg-green-500 dark:text-green-400" />
            Complete
          </Badge>
        )}
    </>
  );
}
