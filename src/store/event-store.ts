import { type Event } from "nostr-tools";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface EventState {
  openBountyEvents: Event[];
  addOpenBountyEvent: (event: Event) => void;
  setOpenBountyEvents: (events: Event[]) => void;
  removeOpenBountyEvent: (id: string) => void;

  postedBountyEvents: Event[];
  addPostedBountyEvent: (event: Event) => void;
  setPostedBountyEvents: (events: Event[]) => void;
  removePostedBountyEvent: (id: string) => void;

  assignedBountyEvents: Event[];
  addAssignedBountyEvent: (event: Event) => void;
  setAssignedBountyEvents: (events: Event[]) => void;
  removeAssignedBountyEvent: (id: string) => void;

  currentBounty: Event | undefined;
  setCurrentBounty: (event: Event | undefined) => void;

  profileMap: Record<string, Event | null>;
  addProfile: (pubkey: string, userEvent: Event) => void;

  appEventMap: Record<string, Event[] | undefined>;
  addAppEvent: (id: string, appEvent: Event) => void;
  setAppEvents: (id: string, appEvents: Event[]) => void;
  removeAppEvent: (id: string) => void;
  clearAppEvents: (id: string) => void;

  tagEventsMap: Record<string, Event[] | undefined>;
  addTagEvent: (id: string, tagEvent: Event) => void;
  setTagEvents: (id: string, tagEvents: Event[]) => void;
  removeTagEvent: (id: string) => void;

  profileBountyMap: Record<string, Record<string, Event | undefined>>;
  addProfileBountyMap: (pubkey: string, bountyId: string, event: Event) => void;
  removeProfileBountyMap: (pubkey: string, bountyId: string) => void;

  zapRecieptMap: Record<string, Event>;
  addZapReciept: (eventId: string, event: Event) => void;
}

const useEventStore = create<EventState>()(
  devtools((set) => ({
    openBountyEvents: [],
    addOpenBountyEvent: (event) =>
      set((prev) => ({
        openBountyEvents: [...prev.openBountyEvents, event],
      })),
    setOpenBountyEvents: (events) => set({ openBountyEvents: events }),
    removeOpenBountyEvent: (id) =>
      set((prev) => ({
        openBountyEvents: prev.openBountyEvents.filter((e) => e.id !== id),
      })),

    postedBountyEvents: [],
    addPostedBountyEvent: (event) =>
      set((prev) => ({
        postedBountyEvents: [...prev.postedBountyEvents, event],
      })),
    setPostedBountyEvents: (events) => set({ postedBountyEvents: events }),
    removePostedBountyEvent: (id) =>
      set((prev) => ({
        postedBountyEvents: prev.postedBountyEvents.filter((e) => e.id !== id),
      })),

    assignedBountyEvents: [],
    addAssignedBountyEvent: (event) =>
      set((prev) => ({
        assignedBountyEvents: [...prev.assignedBountyEvents, event],
      })),
    setAssignedBountyEvents: (events) => set({ assignedBountyEvents: events }),
    removeAssignedBountyEvent: (id) =>
      set((prev) => ({
        assignedBountyEvents: prev.assignedBountyEvents.filter(
          (e) => e.id !== id,
        ),
      })),

    currentBounty: undefined,
    setCurrentBounty: (event) => set({ currentBounty: event }),

    profileMap: {},
    addProfile: (pubkey, userEvent) =>
      set((prev) => {
        const currentEvent = prev.profileMap[pubkey];
        if (!currentEvent || userEvent.created_at > currentEvent.created_at) {
          return {
            profileMap: {
              ...prev.profileMap,
              [pubkey]: userEvent,
            },
          };
        }
        return {};
      }),

    appEventMap: {},

    addAppEvent: (id, appEvent) =>
      set((prev) => ({
        appEventMap: {
          ...prev.appEventMap,
          [id]: [...(prev.appEventMap[id] ?? []), appEvent],
        },
      })),
    setAppEvents: (id, appEvents) =>
      set((prev) => ({
        appEventMap: {
          ...prev.appEventMap,
          [id]: appEvents,
        },
      })),

    removeAppEvent: (id) =>
      set((prev) => {
        const updatedMap = { ...prev.appEventMap };
        delete updatedMap[id];
        return { appEventMap: updatedMap };
      }),
    clearAppEvents: (id) =>
      set((prev) => ({
        appEventMap: {
          ...prev.appEventMap,
          [id]: undefined,
        },
      })),

    tagEventsMap: {},
    addTagEvent: (id, tagEvent) =>
      set((prev) => ({
        tagEventsMap: {
          ...prev.tagEventsMap,
          [id]: [...(prev.tagEventsMap[id] ?? []), tagEvent],
        },
      })),
    setTagEvents: (id, tagEvents) =>
      set((prev) => ({
        tagEventsMap: {
          ...prev.tagEventsMap,
          [id]: tagEvents,
        },
      })),
    removeTagEvent: (id) =>
      set((prev) => {
        const updatedMap = { ...prev.tagEventsMap };
        delete updatedMap[id];
        return { tagEventsMap: updatedMap };
      }),

    profileBountyMap: {},
    addProfileBountyMap: (pubkey, bountyId, event) =>
      set((prev) => ({
        profileBountyMap: {
          ...prev.profileBountyMap,
          [pubkey]: {
            ...prev.profileBountyMap[pubkey],
            [bountyId]: event,
          },
        },
      })),
    removeProfileBountyMap: (pubkey, bountyId) =>
      set((prev) => {
        const updatedMap = { ...prev.profileBountyMap };
        if (!updatedMap[pubkey]) return {};
        if (!updatedMap[pubkey]![bountyId]) return {};
        delete updatedMap[pubkey]![bountyId];
        return { profileBountyMap: updatedMap };
      }),

    zapRecieptMap: {},
    addZapReciept: (eventId, event) =>
      set((prev) => ({
        zapRecieptMap: {
          ...prev.zapRecieptMap,
          [eventId]: event,
        },
      })),
  })),
);

export default useEventStore;
