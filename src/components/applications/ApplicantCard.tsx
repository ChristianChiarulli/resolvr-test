/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @next/next/no-img-element */

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { Badge } from "~/components/ui/badge";
import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import { fromNow } from "~/lib/utils";
import nq from "~/nostr-query";
import { type UseProfileEventParams } from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { Check } from "lucide-react";
import Link from "next/link";
import { type Event } from "nostr-tools";

import { Button } from "../ui/button";
import AcceptApplicationButton from "./AcceptApplicationButton";

type Props = {
  applicationEvent: Event;
};

export default function ApplicationCard({ applicationEvent }: Props) {
  const pubkey = applicationEvent.pubkey;
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
    <li className="flex items-center gap-x-4 rounded-md border bg-secondary/50 p-4">
      <div className="flex w-full flex-col gap-y-1">
        <span className="flex w-full justify-between pb-1">
          <span className="flex items-center gap-x-2 text-sm font-light text-muted-foreground">
            <img
              src={
                nq.profileContent(profileMap[pubkey]).picture ||
                BOT_AVATAR_ENDPOINT + pubkey
              }
              alt=""
              className="aspect-square w-8 rounded-full border border-border dark:border-border"
            />

            {nq.profileContent(profileMap[pubkey]).name || nq.shortNpub(pubkey)}
          </span>
          <AcceptApplicationButton applicationEvent={applicationEvent} />
        </span>
        <span className="flex gap-x-1 text-sm text-muted-foreground">
          <span>Applied</span>
          <span>{fromNow(applicationEvent.created_at) ?? "unknown"}</span>
        </span>
        <span className="py-4">{applicationEvent.content}</span>
        <span className="flex w-full justify-between pt-2 text-sm font-light text-muted-foreground">
          <span>Website</span>
        </span>
      </div>
    </li>
  );
}
