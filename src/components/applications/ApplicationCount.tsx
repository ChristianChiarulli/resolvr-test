import { useMemo } from "react";

import nq from "~/nostr-query";
import { type ATagParams, type UseListEventsParams } from "~/nostr-query/types";
import useListEvents from "~/nostr-query/useListEvents";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event, type Filter } from "nostr-tools";

type Props = {
  bounty: Event;
};

export default function ApplicationCount({ bounty }: Props) {
  const { subRelays } = useRelayStore();
  const {
    appEventMap,
    setAppEvents,
    profileToAppEventMap,
    addProfileToAppEventMap,
  } = useEventStore();

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

  const { loading } = useListEvents(params);

  return <span>{loading ? "0" : appEventMap[bounty.id]?.length ?? 0}</span>;
}
