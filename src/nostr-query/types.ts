import { type Event, type Filter, type SimplePool } from "nostr-tools";

export interface GetEventParams {
  pool?: SimplePool;
  relays: string[];
  filter: Filter;
}

export interface ListEventsParams {
  pool?: SimplePool;
  relays: string[];
  filter: Filter;
  timeout?: number;
  onEvent?: (event: Event) => void;
  onEOSE?: () => void;
  onEventPredicate?: (event: Event) => boolean;
}

export interface BatchedProfileEventsParams {
  pool?: SimplePool;
  relays: string[];
  pubkey: string;
}

export interface UseGetEventParams {
  pool?: SimplePool;
  relays: string[];
  filter: Filter;
  initialEvent: Event | undefined | null;
  onEventResolved?: (events: Event) => void;
  onEventNotFound?: () => void;
}

export interface UseListEventsParams {
  pool?: SimplePool;
  relays: string[];
  filter: Filter;
  initialEvents?: Event[];
  onEvent?: (event: Event) => void;
  onEOSE?: () => void;
  onEventPredicate?: (event: Event) => boolean;
  onEventsResolved?: (events: Event[]) => void;
  onEventsNotFound?: () => void;
}

export interface UseProfileEventParams {
  pool?: SimplePool;
  relays: string[];
  pubkey: string;
  shouldFetch?: boolean;
  onProfileEvent?: (event: Event) => void;
}

export type Profile = {
  relay?: string;
  publicKey?: string;
  about?: string;
  lud06?: string;
  lud16?: string;
  name?: string;
  nip05?: string;
  picture?: string;
  website?: string;
  banner?: string;
  location?: string;
  github?: string;
  [key: string]: unknown;
};

export type UsePublishEventParams = {
  pool?: SimplePool;
  relays: string[];
};

export type PublishEventStatus = "idle" | "pending" | "error" | "success";

export type PublishEventParams = {
  pool?: SimplePool;
  relays: string[];
  event: Event | undefined | null;
  onSeen?: (event: Event) => void;
};
