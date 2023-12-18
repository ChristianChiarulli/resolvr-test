import { useCallback, useState } from "react";

import nq from "~/nostr-query";
import {
  type PublishEventStatus,
  type UsePublishEventParams,
} from "~/nostr-query/types";
import { type Event } from "nostr-tools";

// TODO: expose callback functions for success and error
// TODO: add retry logic
const usePublishEvent = ({
  pool,
  relays,
  // onSuccess = () => {},
  // onError = () => {},
  // retry = 0,
}: UsePublishEventParams) => {
  const [status, setStatus] = useState<PublishEventStatus>("idle");

  const publishEvent = useCallback(
    async (event: Event | undefined, onSeen: (event: Event) => void) => {
      setStatus("pending");

      if (!event) {
        setStatus("error");
        return null;
      }

      const params = {
        relays: relays,
        event: event,
        onSeen: onSeen,
      };

      const publishedEvent = await nq.publish(params);

      setStatus("success");

      return publishedEvent;
    },
    [pool, relays],
  );

  return { publishEvent, status };
};

export default usePublishEvent;
