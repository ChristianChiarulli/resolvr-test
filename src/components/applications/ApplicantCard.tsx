/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @next/next/no-img-element */

import useAuth from "~/hooks/useAuth";
import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import { fromNow } from "~/lib/utils";
import nq from "~/nostr-query";
import { type UseProfileEventParams } from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event } from "nostr-tools";

import AcceptApplicationButton from "./AcceptApplicationButton";
import RemoveApplicationButton from "./RemoveApplicationButton";

type Props = {
  applicationEvent: Event;
  bountyEvent: Event;
};

export default function ApplicationCard({
  applicationEvent,
  bountyEvent,
}: Props) {
  const applicantPubkey = applicationEvent.pubkey;
  const { profileMap, addProfile, zapRecieptMap } = useEventStore();
  const { subRelays } = useRelayStore();
  const { pubkey } = useAuth();

  const params: UseProfileEventParams = {
    pubkey: applicantPubkey,
    relays: subRelays,
    shouldFetch: !profileMap[applicantPubkey],
    onProfileEvent: (event) => {
      addProfile(applicantPubkey, event);
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
                nq.profileContent(profileMap[applicantPubkey]).picture ||
                BOT_AVATAR_ENDPOINT + applicantPubkey
              }
              alt=""
              className="aspect-square w-8 rounded-full border border-border dark:border-border"
            />

            {nq.profileContent(profileMap[applicantPubkey]).name ||
              nq.shortNpub(applicantPubkey)}
          </span>
          {pubkey === bountyEvent.pubkey &&
            !nq.tag("p", bountyEvent) &&
            !zapRecieptMap[bountyEvent.id] && (
              <AcceptApplicationButton
                applicationEvent={applicationEvent}
                bountyEvent={bountyEvent}
              />
            )}
          {pubkey === bountyEvent.pubkey &&
            nq.tag("p", bountyEvent) === applicationEvent.pubkey &&
            !zapRecieptMap[bountyEvent.id] && (
              <RemoveApplicationButton
                applicationEvent={applicationEvent}
                bountyEvent={bountyEvent}
              />
            )}
          {nq.tag("p", bountyEvent) === applicationEvent.pubkey &&
            zapRecieptMap[bountyEvent.id] && (
              <span className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-green-500 dark:text-green-400">
                Solution Accepted
              </span>
            )}
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
