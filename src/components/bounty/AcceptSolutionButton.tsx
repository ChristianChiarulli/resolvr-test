"use client";

import useAuth from "~/hooks/useAuth";
import nq from "~/nostr-query";
import { type UseZapParams } from "~/nostr-query/types";
import useZap from "~/nostr-query/useZap";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { Zap } from "lucide-react";
import { type Event } from "nostr-tools";

import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

type Props = {
  bounty: Event;
  recipientProfile: Event | undefined | null;
};

export default function AcceptSolutionButton({
  bounty,
  recipientProfile,
}: Props) {
  const { addZapReciept, zapRecieptMap } = useEventStore();

  const { pubRelays } = useRelayStore();
  const { pubkey, seckey } = useAuth();

  const { toast } = useToast();

  const params: UseZapParams = {
    relays: pubRelays,
    // TODO: maybe move this to the callback function
    secretKey: seckey,
  };

  const { zap, status } = useZap(params);

  const sendZap = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    if (!pubkey) return;

    const onPaymentSuccess = (sendPaymentResponse: SendPaymentResponse) => {
      toast({
        title: "Zap sent",
        description: `Payment hash: ${sendPaymentResponse.paymentHash}`,
      });
    };

    const onPaymentFailure = () => {
      toast({
        title: "Zap failed",
        description: "Your zap has failed.",
      });
    };

    const onZapReceipt = (zapReceipt: Event) => {
      toast({
        title: "Zap Receipt",
        description: "A receipt has been generated for this zap.",
      });
      addZapReciept(bounty.id, zapReceipt);
    };

    const onNoZapReceipt = () => {
      toast({
        title: "Zap sent",
        description: "Receipt not found, payment",
      });
    };
    if (!recipientProfile) {
      toast({
        title: "Recipient not found",
        description: "The recipient of this bounty could not be found.",
      });
      return;
    }

    const eventId = bounty.id;
    const amount = nq.tag("reward", bounty);
    const content = "";
    await zap(
      recipientProfile,
      eventId,
      Number(amount),
      content,
      onPaymentSuccess,
      onPaymentFailure,
      onZapReceipt,
      onNoZapReceipt,
    );
  };

  return (
    <div className="flex justify-end">
      <div>
        {zapRecieptMap[bounty.id] ? (
          <span className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-green-500 dark:text-green-400">
            Bounty Paid
          </span>
        ) : (
          <Button onClick={sendZap}>
            <Zap className="mr-1 h-4 w-4" />
            Accept Solution ({status})
          </Button>
        )}
      </div>
    </div>
  );
}
