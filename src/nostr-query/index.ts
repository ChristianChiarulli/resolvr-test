import {
  getEventHash,
  getPublicKey,
  getSignature,
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
      console.log("eose");
      console.log("events", events);
      sub.unsub();
      onEOSE();
      resolve(newestEvents(events, filter.limit));
      onEventsResolved(events);
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
  console.log("PUBLISHING EVENT", event);

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

function tags(key: string, event: Event): string[] {
  console.log("event.tags", event.tags);
  return event.tags
    .filter(
      (innerArray) => innerArray[0] === key && innerArray[1] !== undefined,
    )
    .map((innerArray) => innerArray[1]!);
}

function constructTagsByKey(
  key: string,
  values: string[],
): Array<[string, string]> {
  return values.map((value) => [key, value]);
}

// Example usage:
// Assuming event.tags is structured similarly to your previous examples

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

const createATag = ({ kind, pubkey, dTagValue }: ATagParams) => {
  return `${kind}:${pubkey}:${dTagValue}`;
};

async function finishEvent(
  t: EventTemplate,
  secretKey?: string,
  onErr?: (err: Error) => void,
) {
  let event = t as Event;
  if (secretKey) {
    event.pubkey = getPublicKey(secretKey);
  } else {
    event.pubkey = await nostr.getPublicKey();
  }

  console.log("event", event);
  console.log("secretKey", secretKey);
  console.log("event.pubkey", event.pubkey);
  // console.log("publicKey", publicKey);

  event.id = getEventHash(event);

  console.log("event.id", event.id);

  console.log("EVENT", event);

  if (secretKey) {
    console.log("secretKey", secretKey);
    event.sig = getSignature(event, secretKey);
    return event;
  }
  try {
    if (nostr) {
      console.log("nostr", nostr);
      event = (await nostr.signEvent(event)) as Event;
      return event;
    } else {
      console.error("nostr not defined");
      throw new Error("nostr not defined");
    }
  } catch (err) {
    if (onErr) onErr(err as Error);
    return undefined;
  }
}

// Zaps
async function getZapEndpoint(profileEvent: Event) {
  try {
    let lnurl = "";
    const { lud16 } = JSON.parse(profileEvent.content) as Profile;
    if (lud16) {
      const [name, domain] = lud16.split("@");
      lnurl = `https://${domain}/.well-known/lnurlp/${name}`;
    } else {
      return undefined;
    }

    const res = await fetch(lnurl);
    const body = (await res.json()) as ZapResponseBody;

    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback;
    }
  } catch (err) {
    console.error(err);
  }

  return undefined;
}

// I don't think zapping a tags is necessarily a good idea
// https://github.com/nostr-protocol/nips/pull/800#issuecomment-1741177812
export function zapRequest({
  recipientPubkey,
  eventId,
  amount,
  relays,
  content,
}: ZapRequestParams) {
  if (!amount) throw new Error("amount not given");
  if (!recipientPubkey) throw new Error("recipient public key not given");
  if (!relays) throw new Error("relays not given");
  if (!content) content = "";

  const zapRequest: EventTemplate = {
    kind: 9734,
    content,
    tags: [
      ["p", recipientPubkey],
      ["amount", (amount * 1000).toString()],
      ["relays", ...relays],
    ],
    created_at: Math.round(Date.now() / 1000),
  };

  if (eventId) {
    zapRequest.tags.push(["e", eventId]);
  }

  return zapRequest;
}

const fetchInvoice = async (zapEndpoint: string, zapRequestEvent: Event) => {
  const comment = zapRequestEvent.content;
  const amount = tag("amount", zapRequestEvent);
  if (!amount) throw new Error("amount not found");
  console.log("INVOICE AMOUNT", amount);

  let url = `${zapEndpoint}?amount=${amount}&nostr=${encodeURIComponent(
    JSON.stringify(zapRequestEvent),
  )}`;

  console.log("INVOICE URL", url);

  if (comment) {
    url = `${url}&comment=${encodeURIComponent(comment)}`;
  }

  const res = await fetch(url);
  const { pr: invoice } = (await res.json()) as InvoiceResponse;

  return invoice;
};

const weblnConnect = async () => {
  try {
    if (typeof window.webln !== "undefined") {
      await window.webln.enable();
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
};

const payInvoice = async (invoice: string) => {
  const weblnConnected = await weblnConnect();
  if (!weblnConnected) throw new Error("webln not available");

  const webln = window.webln;

  if (!webln) throw new Error("webln not available");

  const paymentRequest = invoice;

  const paymentResponse = await webln.sendPayment(paymentRequest);

  if (!paymentResponse) throw new Error("payment response not found");

  return paymentResponse;
};

const zap = async ({
  relays,
  recipientProfile,
  eventId,
  amount,
  content,
  secretKey,
}: ZapParams) => {
  if (!amount) throw new Error("amount not given");

  const zapRequestEventTemplate = zapRequest({
    recipientPubkey: recipientProfile.pubkey,
    eventId,
    amount,
    relays,
    content,
  });

  const zapRequestEvent = await finishEvent(zapRequestEventTemplate, secretKey);
  console.log("zapRequestEvent", zapRequestEvent);

  if (!zapRequestEvent) throw new Error("zap request event not created");
  console.log("zapRequestEvent", zapRequestEvent);

  // this needs to be a profile event
  const zapEndpoint = await getZapEndpoint(recipientProfile);
  console.log("zapEndpoint", zapEndpoint);

  if (!zapEndpoint) throw new Error("zap endpoint not found");
  console.log("zapEndpoint", zapEndpoint);

  const invoice = await fetchInvoice(zapEndpoint, zapRequestEvent);
  console.log("invoice", invoice);

  if (!invoice) throw new Error("invoice not found");
  console.log("invoice", invoice);

  try {
    return await payInvoice(invoice);
  } catch (err) {
    console.error(err);
    throw new Error("zap failed");
  }
};

const nq = {
  get,
  list,
  listBatchedProfiles,
  fetchProfile,
  profileContent,
  publish,
  tag,
  tags,
  constructTagsByKey,
  shortNpub,
  createNaddr,
  createATag,
  finishEvent,
  zapRequest,
  zap,
  payInvoice,
};

export default nq;
