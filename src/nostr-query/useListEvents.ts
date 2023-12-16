import { useCallback, useEffect, useState } from "react";

import nq from "~/nostr-query";
import { type UseListEventsParams } from "~/nostr-query/types";
import { type Event } from "nostr-tools";

// TODO: load newer events function
// TODO: add invalidation function
const useListEvents = ({
  pool,
  relays,
  filter,
  initialEvents = [],
  onEvent = (event) => {},
  onEOSE = () => {},
  onEventPredicate = () => true,
  onEventsResolved = (events) => {},
  onEventsNotFound = () => {},
}: UseListEventsParams) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  const loadOlderEvents = useCallback(
    async (existingEvents: Event[] | undefined, limit: number) => {
      setLoading(true);
      let filterWithLimit = filter;

      if (limit > 0) {
        filterWithLimit = { ...filter, limit };
      }

      let listParams = {
        pool,
        relays,
        filter: filterWithLimit,
        onEvent,
        onEOSE,
        onEventPredicate,
      };

      if (existingEvents === undefined || existingEvents.length === 0) {
        const newEvents = (await nq.list(listParams)) as Event[];
        setEvents(newEvents);
        onEventsResolved(newEvents);
        setLoading(false);
        return newEvents;
      }

      const lastEvent = existingEvents[existingEvents.length - 1];

      if (!lastEvent) {
        const newEvents = (await nq.list(listParams)) as Event[];
        setEvents(newEvents);
        onEventsResolved(newEvents);
        setLoading(false);
        return newEvents;
      }

      const until = lastEvent.created_at - 10;
      listParams = { ...listParams, filter: { ...filterWithLimit, until } };

      const newEvents = (await nq.list(listParams)) as Event[];
      if (newEvents.length === 0) {
        setLoading(false);
        onEventsNotFound();
      }

      const allEvents = [...existingEvents, ...newEvents];
      setEvents(allEvents);
      onEventsResolved(allEvents);
      setLoading(false);
      return allEvents;
    },
    [pool, relays],
  );

  useEffect(() => {
    if (initialEvents.length > 0) {
      onEventsResolved(initialEvents);
      setEvents(initialEvents);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      const events = (await nq.list({
        pool,
        relays,
        filter,
        onEvent,
        onEOSE,
        onEventPredicate,
      })) as Event[];

      if (events && events.length > 0) {
        onEventsResolved(events);
        setEvents(events);
        setLoading(false);
      }
    };

    void fetchEvents();

    return () => {
      setLoading(false);
    };
  }, [pool, relays]);

  return { loading, events, loadOlderEvents };
};

export default useListEvents;
