import { useEffect, useState } from "react";

import nq from "~/nostr-query";
import { type UseGetEventParams } from "~/nostr-query/types";
import { type Event } from "nostr-tools";

// TODO: add invalidation function
const useGetEvent = ({
  pool,
  relays,
  filter,
  initialEvent = undefined,
  onEventResolved = (_) => {},
  onEventNotFound = () => {},
}: UseGetEventParams) => {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    if (initialEvent) {
      onEventResolved(initialEvent);
      setEvent(initialEvent);
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      const event = await nq.get({
        pool,
        relays,
        filter,
      });

      if (event) {
        onEventResolved(event);
        setEvent(event);
      } else {
        onEventNotFound();
      }
      setLoading(false);
    };

    void fetchEvent();

    return () => {
      setLoading(false);
    };
  }, [pool, relays]);

  return { loading, event };
};

export default useGetEvent;
