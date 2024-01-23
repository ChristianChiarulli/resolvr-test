import useAuth from "~/hooks/useAuth";
import { revalidateCachedTag } from "~/nostr-query/server";
import { useRelayStore } from "~/store/relay-store";
import { Check } from "lucide-react";
import { type Event, type EventTemplate } from "nostr-tools";
import { allTags, finishEvent, tag, usePublish, useZap } from "react-nostr";
import { toast } from "sonner";

import { Button } from "../ui/button";

type Props = {
  applicationEvent: Event;
  bountyEvent: Event;
  recipientMetadata: Event;
};

export default function AcceptSolutionButton({
  applicationEvent,
  bountyEvent,
  recipientMetadata,
}: Props) {
  const { pubkey, seckey } = useAuth();
  const { pubRelays, subRelays } = useRelayStore();
  const {
    zap,
    status: zapStatus,
    sendPaymentResponse,
    zapReceiptEvents,
  } = useZap({
    eventKey: `zap-${applicationEvent.id}`,
    relays: subRelays,
  });
  //
  const { publish, status, invalidateKeys } = usePublish({
    relays: pubRelays,
  });

  const sendZap = async () => {
    if (!pubkey) return;
    console.log("in zap function");

    const onPaymentSuccess = (sendPaymentResponse: SendPaymentResponse) => {
      toast("Zap sent", {
        description: `Payment hash: ${sendPaymentResponse.paymentHash}`,
      });
    };

    const onPaymentFailure = () => {
      toast("Zap failed", {
        description: "Your zap has failed.",
      });
    };

    const onZapReceipts = (_: Event[]) => {
      toast("Zap Receipt", {
        description: "A receipt has been generated for this zap.",
      });
    };

    const onNoZapReceipts = () => {
      toast("Zap sent", {
        description: "Receipt not found, payment",
      });
    };
    if (!recipientMetadata) {
      toast("Recipient not found", {
        description: "The recipient of this bounty could not be found.",
      });
      return;
    }

    const amount = tag("reward", bountyEvent);

    await zap({
      amount: Number(amount),
      recipientMetadata: recipientMetadata,
      eventId: bountyEvent.id,
      content: "",
      secretKey: seckey,
      onPaymentSuccess,
      onPaymentFailure,
      onZapReceipts,
      onNoZapReceipts,
    });
  };

  async function handleAcceptSolution(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    if (!pubkey) {
      // TODO: show error toast
      return;
    }

    console.log("gonna send zap");

    await sendZap();

    const identifier = tag("d", bountyEvent);
    const title = tag("title", bountyEvent);
    const reward = tag("reward", bountyEvent);
    const currency = tag("c", bountyEvent);
    const tTags = allTags("t", bountyEvent);

    if (!identifier || !title || !reward || !currency) {
      return;
    }

    const tags = [
      ["d", identifier],
      ["title", title],
      ["s", "complete"],
      ["reward", reward],
      ["c", currency],
      ["p", applicationEvent.pubkey],
      // TODO: find out why this is adding backticks
      // ["r", JSON.stringify(applicationEvent)],
    ];

    if (subRelays[0]) {
      tags.push(["e", applicationEvent.id, subRelays[0]]);
    } else {
      tags.push(["e", applicationEvent.id]);
    }

    if (tTags.length > 0) {
      tTags.forEach((tag) => {
        tags.push(["t", tag]);
      });
    }

    const eventTemplate: EventTemplate = {
      kind: 30050,
      tags: tags,
      content: bountyEvent.content,
      created_at: Math.floor(Date.now() / 1000),
    };

    const event = await finishEvent(eventTemplate, seckey);

    const onSuccess = (event: Event) => {
      // TODO: REMOVE THE OLD APPLICATION EVENTS for the old bounty id
      revalidateCachedTag("open-bounties");
      revalidateCachedTag(`posted-bounties-${pubkey}`);
      revalidateCachedTag(`assigned-bounties-${applicationEvent.pubkey}`);
      const dTagValue = tag("d", bountyEvent);
      const bountyPubkey = bountyEvent.pubkey;
      revalidateCachedTag(`${dTagValue}-${bountyPubkey}`);
    };

    if (!event) {
      // TODO: show error toast
      return;
    }


    await publish(event, onSuccess);
  }

  return (
    // {tag("s", bountyEvent) === "submitted" && (
    //   <span className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-green-500 dark:text-green-400">
    //     Solution Provided
    //   </span>
    // )}

    // pubkey === bountyEvent.pubkey &&
    // tag("s", bountyEvent) === "open" &&
    // tag("s", applicationEvent) === "submitted" &&
    // tag("p", bountyEvent) && (

    <Button
      onClick={handleAcceptSolution}
      variant="default"
      size="sm"
      className="flex gap-x-1"
    >
      <Check className="mr-1 h-4 w-4" />
      Accept Solution
    </Button>
  );
}
