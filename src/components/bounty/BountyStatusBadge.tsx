import React from "react";

import nq from "~/nostr-query";
import { type UseGetEventParams } from "~/nostr-query/types";
import useGetEvent from "~/nostr-query/useGetEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Filter, type Event } from "nostr-tools";

import { Badge } from "../ui/badge";

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
      {nq.tag("s", bounty) === "open" && (
        <Badge className="text-sm" variant="outline">
          {nq.tag("s", bounty)}
        </Badge>
      )}
      {bounty &&
        nq.tag("s", bounty) === "assigned" &&
        !zapRecieptMap[bounty.id] && (
          <Badge className="text-sm" variant="outline">
            {nq.tag("s", bounty)}
          </Badge>
        )}
      {bounty &&
        nq.tag("s", bounty) === "assigned" &&
        zapRecieptMap[bounty.id] && (
          <Badge className="text-sm" variant="outline">
            Completed
          </Badge>
        )}
    </>
  );
}
