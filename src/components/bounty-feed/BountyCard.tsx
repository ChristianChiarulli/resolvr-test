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
import { User } from "lucide-react";
import Link from "next/link";
import { type Event } from "nostr-tools";

import ApplicationCount from "../applications/ApplicationCount";

type Props = {
  bountyEvent: Event;
};

export default function BountyCard({ bountyEvent }: Props) {
  const pubkey = bountyEvent.pubkey;
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
    <Link href={`/b/${nq.createNaddr(bountyEvent, subRelays)}`}>
      <li className="flex cursor-pointer items-center gap-x-4 border-t p-4 hover:bg-muted/40">
        <img
          src={
            nq.profileContent(profileMap[pubkey]).picture ||
            BOT_AVATAR_ENDPOINT + pubkey
          }
          alt=""
          className="aspect-square w-16 rounded-md border border-border dark:border-border"
        />

        <div className="flex w-full flex-col gap-y-1">
          <span className="flex w-full justify-between pb-1">
            <span className="text-sm font-light text-muted-foreground">
              {nq.profileContent(profileMap[pubkey]).name ||
                nq.shortNpub(pubkey)}
            </span>
            {nq.tag("t", bountyEvent) && (
              <Badge variant="outline">{nq.tag("t", bountyEvent)}</Badge>
            )}
          </span>
          <span className="text-base text-card-foreground">
            {nq.tag("title", bountyEvent)}
          </span>
          <span className="flex items-center text-lg font-semibold text-orange-500 dark:text-orange-400">
            <SatoshiV2Icon className="h-6 w-6" />
            {Number(nq.tag("reward", bountyEvent)).toLocaleString()}
          </span>
          <span className="flex w-full justify-between pt-2 text-sm font-light text-muted-foreground">
            <span>{fromNow(bountyEvent.created_at) ?? "unknown"}</span>
            <span className="flex items-center gap-x-1">
              <User className="h-4 w-4" />
              <ApplicationCount bounty={bountyEvent} />
              Applicants
            </span>
          </span>
        </div>
      </li>
    </Link>
  );
}
