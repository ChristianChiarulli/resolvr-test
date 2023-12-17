import { useState } from "react";

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import useAuth from "~/hooks/useAuth";
import nq from "~/nostr-query";
import {
  type ATagParams,
  type UsePublishEventParams,
} from "~/nostr-query/types";
import usePublishEvent from "~/nostr-query/usePublishEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { UserPlus2 } from "lucide-react";
import { getEventHash, getSignature, type Event } from "nostr-tools";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type Props = {
  bounty: Event;
};

export default function CompleteButton({ bounty }: Props) {
  const { pubRelays } = useRelayStore();
  const { pubkey, seckey } = useAuth();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const { addAppEvent, profileBountyMap, addProfileBountyMap } =
    useEventStore();

  const params: UsePublishEventParams = {
    relays: pubRelays,
  };
  const { publishEvent, status } = usePublishEvent(params);

  async function signEvent(event: Event) {
    // TODO: handle error, allow user to pass function to handle error
    if (seckey) {
      event.sig = getSignature(event, seckey);
      return event;
    }
    event = (await nostr.signEvent(event)) as Event;
    return event;
  }

  async function handleApply(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    if (!pubkey) return;

    const dTagValue = nq.tag("d", bounty);
    if (!dTagValue) return;

    const aTagParams: ATagParams = {
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue,
    };

    const aTag = nq.createATag(aTagParams);

    const recommendedRelay = pubRelays[0];

    if (!recommendedRelay) return;

    const tags = [
      ["a", aTag, recommendedRelay],
      ["p", bounty.pubkey],
      ["description", JSON.stringify(bounty)],
    ];

    let event: Event = {
      kind: 8050,
      tags: tags,
      content: message,
      created_at: Math.floor(Date.now() / 1000),
      pubkey: pubkey,
      id: "",
      sig: "",
    };
    event.id = getEventHash(event);
    // event = (await nostr.signEvent(event)) as Event;
    event = await signEvent(event);
    const onSeen = (event: Event) => {
      addAppEvent(bounty.id, event);
      addProfileBountyMap(pubkey, bounty.id, event);
      setOpen(false);
    };

    await publishEvent(event, onSeen);
  }

  if (!pubkey) return null;

  // TODO: profile to app event map is stupid

  return (
    <Button
      size="sm"
      variant="success"
      disabled={status === "pending"}
      onClick={() => setOpen(true)}
      className="flex text-sm"
    >
      Complete
    </Button>
  );
}
