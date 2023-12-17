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

export default function ApplyButton({ bounty }: Props) {
  const { pubRelays } = useRelayStore();
  const { pubkey, seckey } = useAuth();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const { addAppEvent, profileToAppEventMap } = useEventStore();

  const params: UsePublishEventParams = {
    relays: pubRelays,
  };
  const { publishEvent, status } = usePublishEvent(params);

  async function signEvent(event: Event) {
    // TODO: handle error, allow user to pass function to handle error
    if (seckey) {
      event.sig = getSignature(event, seckey)
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
      setOpen(false);
    };

    await publishEvent(event, onSeen);
  }

  if (!pubkey) return null;

  return (
    <>
      {profileToAppEventMap[pubkey] ? (
        <span className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-green-500 dark:text-green-400">
          Applied
        </span>
      ) : status === "pending" ? (
        <Button size="sm" disabled className="flex text-sm">
          <UserPlus2 className="mr-1 h-4 w-4" />
          Apply
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="flex text-sm"
        >
          <UserPlus2 className="mr-1 h-4 w-4" />
          Apply
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bounty Application</DialogTitle>
            <DialogDescription>
              You're application will be sent to the bounty creator for review.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Label
              htmlFor="message"
              className="flex items-center py-4 text-left"
            >
              Reward:
              <span className="flex items-center text-base font-semibold text-orange-500 dark:text-orange-400">
                <SatoshiV2Icon className="h-5 w-5" />
                {Number(nq.tag("reward", bounty)).toLocaleString()}
              </span>
            </Label>
            <Label htmlFor="message" className="text-left">
              Message
            </Label>
            <Textarea
              id="message"
              className="col-span-3"
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleApply}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
