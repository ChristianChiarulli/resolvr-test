import { nip19, SimplePool, type Event, type Filter } from "nostr-tools";
import { type AddressPointer } from "nostr-tools/nip19";

import {
  type GetEventParams,
  type BatchedProfileEventsParams,
  type ListEventsParams,
  type Profile,
  type PublishEventParams,
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
}: ListEventsParams) => {
  return new Promise((resolve) => {
    const sub = pool.sub(relays, [filter]);
    const events: Event[] = [];

    const _timeout = setTimeout(() => {
      sub.unsub();
      resolve(newestEvents(events, filter.limit));
    }, timeout);

    sub.on("eose", () => {
      sub.unsub();
      onEOSE();
      resolve(newestEvents(events, filter.limit));
    });

    sub.on("event", (event) => {
      if (onEventPredicate(event)) {
        // console.log("event", event);
        events.push(event);
        clearTimeout(_timeout);
        onEvent(event);
      }
    });
  });
};

// TODO: get the latest profile event for a pubkey
const listBatchedProfiles = ({
  pool = defaultPool,
  relays,
  pubkey,
}: BatchedProfileEventsParams) => {
  const filter: Filter = {
    kinds: [0],
    authors: [pubkey],
    limit: 1,
  };
  return pool.batchedList("profiles", relays, [filter]);
};

const fetchProfile = ({
  pool = defaultPool,
  relays,
  pubkey,
}: BatchedProfileEventsParams) => {
  const filter: Filter = {
    kinds: [0],
    authors: [pubkey],
    limit: 1,
  };
  return pool.get(relays, filter);
};

const profileContent = (event: Event | undefined | null) => {
  return JSON.parse(event?.content ?? "{}") as Profile;
};

const publish = async ({
  pool = defaultPool,
  event,
  relays,
  onSeen = () => {},
}: PublishEventParams) => {
  if (!event) {
    return null;
  }

  const pubs = pool.publish(relays, event);

  try {
    await Promise.allSettled(pubs);
  } catch (e) {
    console.error(e);
    return null;
  }

  const publishedEvent = await pool.get(relays, {
    ids: [event.id],
  });

  if (publishedEvent) {
    onSeen(publishedEvent);
  }

  return publishedEvent;
};

// gets the first value of a tag
function tag(key: string, event: Event | undefined) {
  if (!event) {
    return undefined;
  }
  const array = event.tags;
  if (!array) {
    return undefined;
  }
  const item = array.find((element) => element[0] === key);
  return item ? item[1] : undefined;
}

const shortNpub = (pubkey: string | undefined, length = 4 as number) => {
  if (!pubkey) {
    return "";
  }
  return (
    // pubkey.substring(0, length) + "..." + pubkey.substring(pubkey.length - length)
    `npub...${pubkey.substring(pubkey.length - length)}`
  );
};

const createNaddr = (
  event: Event | undefined,
  relays: string[] | undefined = undefined,
) => {
  const identifier = nq.tag("d", event);
  if (!identifier) {
    return null;
  }
  if (!event) {
    return null;
  }

  const addressPointer: AddressPointer = {
    identifier: identifier,
    pubkey: event.pubkey,
    kind: event.kind,
    relays,
  };

  return nip19.naddrEncode(addressPointer);
};

const nq = {
  get,
  list,
  listBatchedProfiles,
  fetchProfile,
  profileContent,
  publish,
  tag,
  shortNpub,
  createNaddr,
};

export default nq;
