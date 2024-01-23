import { useState } from "react";

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import useAuth from "~/hooks/useAuth";
import {
  type ATagParams,
  type UsePublishEventParams,
} from "~/nostr-query/types";
import usePublishEvent from "~/nostr-query/usePublishEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { UserPlus2 } from "lucide-react";
import { getEventHash, type Event, EventTemplate } from "nostr-tools";

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
import { createATag, finishEvent, tag } from "react-nostr";

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

  async function handleApply(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    if (!pubkey) return;

    const dTagValue = tag("d", bounty);
    if (!dTagValue) return;

    const aTagParams: ATagParams = {
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue,
    };

    const aTag = createATag(aTagParams);

    const recommendedRelay = pubRelays[0];

    if (!recommendedRelay) return;

    const tags = [
      ["a", aTag, recommendedRelay],
      ["p", bounty.pubkey],
      ["description", JSON.stringify(bounty)],
    ];

    const t: EventTemplate = {
      kind: 30051,
      tags: tags,
      content: message,
      created_at: Math.floor(Date.now() / 1000),
    };
    const event = await finishEvent(t, seckey);
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
