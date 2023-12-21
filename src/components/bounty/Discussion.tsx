"use client";

import { type UseProfileEventParams } from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event } from "nostr-tools";

import AcceptSolutionButton from "./AcceptSolutionButton";
import EncryptedChat from "./EncryptedChat";
import { useEffect, useState } from "react";

type Props = {
  bounty: Event;
  applicantPubkey: string;
};

export default function Discussion({ bounty, applicantPubkey }: Props) {
  const { profileMap, addProfile } = useEventStore();
  const { subRelays } = useRelayStore();

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
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-end">
        <AcceptSolutionButton
          bounty={bounty}
          recipientProfile={profileMap[applicantPubkey]}
        />
      </div>
      <EncryptedChat bounty={bounty} />
    </div>
  );
}
