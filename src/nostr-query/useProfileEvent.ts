import { useEffect, useState } from "react";

import nq from "~/nostr-query";
import { type UseProfileEventParams } from "~/nostr-query/types";
import { type Event } from "nostr-tools";

// TODO: option for batched profile events
// NOTE: batching seems to be slow
const useProfileEvent = ({
  pool,
  relays,
  pubkey,
  shouldFetch = true,
  onProfileEvent = (event) => {},
}: UseProfileEventParams) => {
  const [loading, setLoading] = useState(true);
  const [profileEvent, setProfileEvent] = useState<Event>();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileEvent: Event | null = await nq.fetchProfile({
          pubkey,
          relays,
        });
        if (!profileEvent) {
          setLoading(false);
          return;
        }
        setProfileEvent(profileEvent);
        onProfileEvent(profileEvent);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    if (shouldFetch) {
      setLoading(true);
      void fetchProfile();
    } else {
      setLoading(false);
    }

    return () => {
      setLoading(false);
    };
  }, [pool, relays]);

  return { loading, profileEvent };
};

export default useProfileEvent;
