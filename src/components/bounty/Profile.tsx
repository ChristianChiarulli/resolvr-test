/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @next/next/no-img-element */
"use client";

import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import nq from "~/nostr-query";
import { type UseProfileEventParams } from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";

type Props = {
  pubkey: string;
};

export default function Profile({ pubkey }: Props) {
  const { profileMap, addProfile } = useEventStore();
  const { subRelays } = useRelayStore();

  const params: UseProfileEventParams = {
    pubkey: pubkey,
    relays: subRelays,
    shouldFetch: !profileMap[pubkey],
    onProfileEvent: (event) => {
      addProfile(pubkey, event);
    },
  };

  useProfileEvent(params);

  return (
    <div className="flex items-center gap-x-2">
      <img
        src={
          nq.profileContent(profileMap[pubkey]).picture ||
          BOT_AVATAR_ENDPOINT + pubkey
        }
        alt=""
        className="aspect-square w-8 rounded-full border border-border dark:border-border"
      />
      <span className="text-base text-muted-foreground">
        {nq.profileContent(profileMap[pubkey]).name || nq.shortNpub(pubkey)}
      </span>
    </div>
  );
}
