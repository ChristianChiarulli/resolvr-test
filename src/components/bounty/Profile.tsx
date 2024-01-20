/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @next/next/no-img-element */
"use client";

import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import { type UseProfileEventParams } from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import { profileContent, shortNpub } from "react-nostr";

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
    <Link
      className="flex items-center gap-x-2"
      href={`/u/${nip19.npubEncode(pubkey)}`}
    >
      <img
        src={
          profileContent(profileMap[pubkey]).picture ||
          BOT_AVATAR_ENDPOINT + pubkey
        }
        alt=""
        className="aspect-square w-8 rounded-full border border-border dark:border-border"
      />
      <span className="text-base text-muted-foreground">
        {profileContent(profileMap[pubkey]).name || shortNpub(pubkey)}
      </span>
    </Link>
  );
}
