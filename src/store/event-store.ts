import { type Event } from "nostr-tools";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface EventState {
  newBountyEvents: Event[];
  addNewBountyEvent: (event: Event) => void;
  setNewBountyEvents: (events: Event[]) => void;
  removeNewBountyEvent: (id: string) => void;

  openBountyEvents: Event[];
  addOpenBountyEvent: (event: Event) => void;
  setOpenBountyEvents: (events: Event[]) => void;
  removeOpenBountyEvent: (id: string) => void;

  profileMap: Record<string, Event | null>;
  addProfile: (pubkey: string, userEvent: Event) => void;

  zapReciepts: Record<string, Event[]>;
  addZapReciept: (eventId: string, event: Event) => void;
}

const useEventStore = create<EventState>()(
  devtools((set) => ({
    newBountyEvents: [],
    addNewBountyEvent: (event) =>
      set((prev) => ({
        newBountyEvents: [...prev.newBountyEvents, event],
      })),
    setNewBountyEvents: (events) => set({ newBountyEvents: events }),
    removeNewBountyEvent: (id) =>
      set((prev) => ({
        newBountyEvents: prev.newBountyEvents.filter((e) => e.id !== id),
      })),

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

    zapReciepts: {},
    addZapReciept: (eventId, event) =>
      set((prev) => ({
        zapReciepts: {
          ...prev.zapReciepts,
          [eventId]: [...(prev.zapReciepts[eventId] ?? []), event],
        },
      })),
  })),
);

export default useEventStore;
