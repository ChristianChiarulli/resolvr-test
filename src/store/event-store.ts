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

  profileMap: Record<string, Event | null>;
  addProfile: (pubkey: string, userEvent: Event) => void;

  zapReciepts: Record<string, Event[]>;
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
