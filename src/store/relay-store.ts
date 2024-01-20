import { type RelayUrl } from "react-nostr";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface RelayState {
  subRelays: RelayUrl[];
  pubRelays: RelayUrl[];
  setSubscribeRelays: (relays: RelayUrl[]) => void;
  setPublishRelays: (relays: RelayUrl[]) => void;
}

export const useRelayStore = create<RelayState>()(
  devtools(
    persist(
      (set, _) => ({
        subRelays: ["wss://nos.lol", "wss://relay.damus.io"],
        pubRelays: ["wss://nos.lol", "wss://relay.damus.io"],
        setSubscribeRelays: (relays) => set({ subRelays: relays }),
        setPublishRelays: (relays) => set({ pubRelays: relays }),
      }),
      {
        name: "resolvr-relay-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          subscribeRelays: state.subRelays,
          publishRelays: state.pubRelays,
        }),
      },
    ),
  ),
);
