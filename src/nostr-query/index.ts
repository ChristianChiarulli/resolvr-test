import {
  getEventHash,
  getPublicKey,
  nip04,
  nip19,
  SimplePool,
  type Event,
  type EventTemplate,
  type Filter,
} from "nostr-tools";
import { type AddressPointer } from "nostr-tools/nip19";

import {
  type ATagParams,
  type BatchedProfileEventsParams,
  type EncryptMessageParams,
  type GetEventParams,
  type InvoiceResponse,
  type ListEventsParams,
  type Profile,
  type PublishEventParams,
  type ZapParams,
  type ZapRequestParams,
  type ZapResponseBody,
} from "./types";

const defaultPool = new SimplePool();

function newestEvents(events: Event[], n: number | undefined) {
  events.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  if (n === undefined) {
    return events;
  }
  return events.slice(0, n);
}

const get = ({ pool = defaultPool, relays, filter }: GetEventParams) => {
  return pool.get(relays, filter);
};

const list = ({
  pool = defaultPool,
  relays,
  filter,
  timeout = 3000,
  onEvent = (_: Event) => {},
  onEOSE = () => {},
  onEventPredicate = () => true,
  onEventsResolved = (_: Event[]) => {},
}: ListEventsParams) => {
  return new Promise<Event[] | undefined | null>((resolve) => {
    const sub = pool.sub(relays, [filter]);
    const events: Event[] = [];

    const _timeout = setTimeout(() => {
      sub.unsub();
      resolve(newestEvents(events, filter.limit));
      onEventsResolved(events);
    }, timeout);

    sub.on("eose", () => {
      sub.unsub();
      onEOSE();
      resolve(newestEvents(events, filter.limit));
      onEventsResolved(events);
    });

    sub.on("event", (event) => {
      if (onEventPredicate(event)) {
        events.push(event);
        clearTimeout(_timeout);
        onEvent(event);
      }
    });
  });
};





const nq = {
  get,
  list,
};

export default nq;
